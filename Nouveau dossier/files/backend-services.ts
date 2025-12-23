// ==========================================
// src/services/powerbi.service.ts
// ==========================================

import axios from 'axios';
import { msalClient, powerbiConfig } from '../config/powerbi.config.js';
import { redis, CACHE_TTL, CACHE_KEYS } from '../config/redis.config.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

export interface EmbedToken {
  token: string;
  tokenId: string;
  expiration: string;
}

export interface ReportEmbedConfig {
  type: 'report';
  id: string;
  embedUrl: string;
  accessToken: string;
  tokenType: number;
  settings: any;
}

class PowerBIService {
  private accessToken: string | null = null;
  private tokenExpiry: number | null = null;

  /**
   * Get Power BI access token with caching
   */
  async getAccessToken(): Promise<string> {
    try {
      // Check cache first
      const cachedToken = await redis.get(CACHE_KEYS.POWERBI_TOKEN + 'access');
      if (cachedToken) {
        return cachedToken;
      }

      // Get new token from Azure AD
      const tokenResponse = await msalClient.acquireTokenByClientCredential({
        scopes: powerbiConfig.scopes,
      });

      if (!tokenResponse || !tokenResponse.accessToken) {
        throw new AppError('Failed to acquire Power BI access token', 500);
      }

      // Cache token (expires in 1 hour, cache for 55 minutes)
      await redis.setex(
        CACHE_KEYS.POWERBI_TOKEN + 'access',
        3300, // 55 minutes
        tokenResponse.accessToken
      );

      return tokenResponse.accessToken;
    } catch (error) {
      logger.error('Error getting Power BI access token:', error);
      throw new AppError('Failed to get Power BI access token', 500);
    }
  }

  /**
   * Get embed token for a specific report
   */
  async getEmbedToken(
    workspaceId: string,
    reportId: string,
    userId?: string
  ): Promise<EmbedToken> {
    try {
      const accessToken = await this.getAccessToken();

      const requestBody = {
        datasets: [],
        reports: [{ id: reportId }],
        ...(userId && { identities: [{ username: userId }] }),
      };

      const response = await axios.post(
        `${powerbiConfig.apiUrl}/groups/${workspaceId}/reports/${reportId}/GenerateToken`,
        requestBody,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Error generating embed token:', error.response?.data || error);
      throw new AppError('Failed to generate embed token', 500);
    }
  }

  /**
   * Get report details
   */
  async getReport(workspaceId: string, reportId: string): Promise<any> {
    try {
      const accessToken = await this.getAccessToken();

      const response = await axios.get(
        `${powerbiConfig.apiUrl}/groups/${workspaceId}/reports/${reportId}`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      logger.error('Error getting report:', error.response?.data || error);
      throw new AppError('Failed to get report details', 500);
    }
  }

  /**
   * Get embed configuration for a report
   */
  async getEmbedConfig(
    organization: 'school' | 'crm',
    reportType: string,
    userId?: string
  ): Promise<ReportEmbedConfig> {
    try {
      const config = organization === 'school' 
        ? powerbiConfig.school 
        : powerbiConfig.crm;

      const reportId = (config.reports as any)[reportType];
      
      if (!reportId) {
        throw new AppError('Report not found', 404);
      }

      // Get report details
      const report = await this.getReport(config.workspaceId, reportId);

      // Get embed token
      const embedToken = await this.getEmbedToken(
        config.workspaceId,
        reportId,
        userId
      );

      return {
        type: 'report',
        id: reportId,
        embedUrl: report.embedUrl,
        accessToken: embedToken.token,
        tokenType: 0, // Embed token
        settings: {
          filterPaneEnabled: true,
          navContentPaneEnabled: true,
          layoutType: 1, // Custom
          background: 2, // Transparent
        },
      };
    } catch (error) {
      logger.error('Error getting embed config:', error);
      throw error;
    }
  }

  /**
   * Refresh dataset
   */
  async refreshDataset(workspaceId: string, datasetId: string): Promise<void> {
    try {
      const accessToken = await this.getAccessToken();

      await axios.post(
        `${powerbiConfig.apiUrl}/groups/${workspaceId}/datasets/${datasetId}/refreshes`,
        {},
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
        }
      );

      logger.info(`Dataset ${datasetId} refresh triggered`);
    } catch (error: any) {
      logger.error('Error refreshing dataset:', error.response?.data || error);
      throw new AppError('Failed to refresh dataset', 500);
    }
  }

  /**
   * Export report to PDF
   */
  async exportToPDF(
    workspaceId: string,
    reportId: string
  ): Promise<Buffer> {
    try {
      const accessToken = await this.getAccessToken();

      // Initiate export
      const exportResponse = await axios.post(
        `${powerbiConfig.apiUrl}/groups/${workspaceId}/reports/${reportId}/ExportTo`,
        { format: 'PDF' },
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json',
          },
        }
      );

      const exportId = exportResponse.data.id;

      // Poll for completion
      let status = 'Running';
      let attempts = 0;
      const maxAttempts = 30;

      while (status === 'Running' && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds

        const statusResponse = await axios.get(
          `${powerbiConfig.apiUrl}/groups/${workspaceId}/reports/${reportId}/exports/${exportId}`,
          {
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        );

        status = statusResponse.data.status;
        attempts++;
      }

      if (status !== 'Succeeded') {
        throw new AppError('Export failed or timed out', 500);
      }

      // Download the file
      const fileResponse = await axios.get(
        `${powerbiConfig.apiUrl}/groups/${workspaceId}/reports/${reportId}/exports/${exportId}/file`,
        {
          headers: {
            Authorization: `Bearer ${accessToken}`,
          },
          responseType: 'arraybuffer',
        }
      );

      return Buffer.from(fileResponse.data);
    } catch (error: any) {
      logger.error('Error exporting to PDF:', error.response?.data || error);
      throw new AppError('Failed to export report to PDF', 500);
    }
  }

  /**
   * Get available reports for organization
   */
  getAvailableReports(organization: 'school' | 'crm'): Record<string, string> {
    return organization === 'school' 
      ? powerbiConfig.school.reports 
      : powerbiConfig.crm.reports;
  }
}

export const powerbiService = new PowerBIService();

// ==========================================
// src/services/auth.service.ts
// ==========================================

import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../config/database.config.js';
import { jwtConfig } from '../config/jwt.config.js';
import { hashPassword, comparePassword } from '../utils/bcrypt.utils.js';
import { NotFoundError, UnauthorizedError, ConflictError } from '../utils/errors.js';

export interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role?: string;
  organization?: string;
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    organization?: string;
  };
  accessToken: string;
  refreshToken: string;
}

class AuthService {
  /**
   * Register new user
   */
  async register(data: RegisterData): Promise<LoginResponse> {
    try {
      // Check if user already exists
      const existingUser = await prisma.user.findUnique({
        where: { email: data.email },
      });

      if (existingUser) {
        throw new ConflictError('Un utilisateur avec cet email existe déjà');
      }

      // Hash password
      const hashedPassword = await hashPassword(data.password);

      // Create user
      const user = await prisma.user.create({
        data: {
          email: data.email,
          password: hashedPassword,
          firstName: data.firstName,
          lastName: data.lastName,
          role: data.role || 'USER',
          organization: data.organization,
        },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization || undefined,
        },
        ...tokens,
      };
    } catch (error) {
      logger.error('Error registering user:', error);
      throw error;
    }
  }

  /**
   * Login user
   */
  async login(email: string, password: string): Promise<LoginResponse> {
    try {
      // Find user
      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        throw new UnauthorizedError('Email ou mot de passe incorrect');
      }

      // Check if user is active
      if (!user.isActive) {
        throw new UnauthorizedError('Compte désactivé');
      }

      // Verify password
      const isValidPassword = await comparePassword(password, user.password);

      if (!isValidPassword) {
        throw new UnauthorizedError('Email ou mot de passe incorrect');
      }

      // Update last login
      await prisma.user.update({
        where: { id: user.id },
        data: { lastLogin: new Date() },
      });

      // Generate tokens
      const tokens = await this.generateTokens(user);

      return {
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role,
          organization: user.organization || undefined,
        },
        ...tokens,
      };
    } catch (error) {
      logger.error('Error logging in:', error);
      throw error;
    }
  }

  /**
   * Refresh access token
   */
  async refreshToken(refreshToken: string): Promise<{ accessToken: string }> {
    try {
      // Verify refresh token
      const decoded = jwt.verify(refreshToken, jwtConfig.refreshSecret) as {
        userId: string;
        tokenId: string;
      };

      // Check if refresh token exists in database
      const storedToken = await prisma.refreshToken.findUnique({
        where: { token: refreshToken },
        include: { user: true },
      });

      if (!storedToken || storedToken.expiresAt < new Date()) {
        throw new UnauthorizedError('Token de rafraîchissement invalide ou expiré');
      }

      // Check if user is active
      if (!storedToken.user.isActive) {
        throw new UnauthorizedError('Compte désactivé');
      }

      // Generate new access token
      const accessToken = this.generateAccessToken(storedToken.user);

      return { accessToken };
    } catch (error) {
      logger.error('Error refreshing token:', error);
      throw new UnauthorizedError('Token de rafraîchissement invalide');
    }
  }

  /**
   * Logout user
   */
  async logout(refreshToken: string): Promise<void> {
    try {
      await prisma.refreshToken.delete({
        where: { token: refreshToken },
      });
    } catch (error) {
      logger.error('Error logging out:', error);
      // Don't throw error, logout should always succeed
    }
  }

  /**
   * Generate access and refresh tokens
   */
  private async generateTokens(user: any): Promise<{
    accessToken: string;
    refreshToken: string;
  }> {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = await this.generateRefreshToken(user.id);

    return { accessToken, refreshToken };
  }

  /**
   * Generate access token
   */
  private generateAccessToken(user: any): string {
    return jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        organization: user.organization,
      },
      jwtConfig.secret,
      {
        expiresIn: jwtConfig.expiresIn,
        issuer: jwtConfig.issuer,
        audience: jwtConfig.audience,
      }
    );
  }

  /**
   * Generate refresh token
   */
  private async generateRefreshToken(userId: string): Promise<string> {
    const tokenId = uuidv4();
    const token = jwt.sign(
      { userId, tokenId },
      jwtConfig.refreshSecret,
      { expiresIn: jwtConfig.refreshExpiresIn }
    );

    // Calculate expiration date
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 days

    // Store in database
    await prisma.refreshToken.create({
      data: {
        id: tokenId,
        token,
        userId,
        expiresAt,
      },
    });

    return token;
  }

  /**
   * Verify email
   */
  async verifyEmail(userId: string): Promise<void> {
    await prisma.user.update({
      where: { id: userId },
      data: { isVerified: true },
    });
  }

  /**
   * Request password reset
   */
  async requestPasswordReset(email: string): Promise<string> {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      // Don't reveal if email exists
      return 'reset-token-placeholder';
    }

    // Generate reset token (valid for 1 hour)
    const resetToken = jwt.sign(
      { userId: user.id, type: 'password-reset' },
      jwtConfig.secret,
      { expiresIn: '1h' }
    );

    return resetToken;
  }

  /**
   * Reset password
   */
  async resetPassword(token: string, newPassword: string): Promise<void> {
    try {
      const decoded = jwt.verify(token, jwtConfig.secret) as {
        userId: string;
        type: string;
      };

      if (decoded.type !== 'password-reset') {
        throw new UnauthorizedError('Token invalide');
      }

      const hashedPassword = await hashPassword(newPassword);

      await prisma.user.update({
        where: { id: decoded.userId },
        data: { password: hashedPassword },
      });

      // Invalidate all refresh tokens
      await prisma.refreshToken.deleteMany({
        where: { userId: decoded.userId },
      });
    } catch (error) {
      throw new UnauthorizedError('Token invalide ou expiré');
    }
  }
}

export const authService = new AuthService();

// ==========================================
// src/services/email.service.ts
// ==========================================

import { emailTransporter, emailConfig } from '../config/email.config.js';

export interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  attachments?: any[];
}

class EmailService {
  /**
   * Send email
   */
  async sendEmail(options: EmailOptions): Promise<void> {
    try {
      await emailTransporter.sendMail({
        from: `${emailConfig.from.name} <${emailConfig.from.address}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
        attachments: options.attachments,
      });

      logger.info(`Email sent to ${options.to}`);
    } catch (error) {
      logger.error('Error sending email:', error);
      throw new AppError('Failed to send email', 500);
    }
  }

  /**
   * Send welcome email to student
   */
  async sendWelcomeStudent(email: string, name: string, credentials: any): Promise<void> {
    const html = `
      <h1>Bienvenue à School 1cc, ${name}!</h1>
      <p>Votre compte a été créé avec succès.</p>
      <p><strong>Vos identifiants:</strong></p>
      <ul>
        <li>Email: ${email}</li>
        <li>Mot de passe temporaire: ${credentials.temporaryPassword}</li>
      </ul>
      <p>Veuillez changer votre mot de passe lors de votre première connexion.</p>
      <p>Connectez-vous sur: <a href="http://localhost:5173">School 1cc</a></p>
    `;

    await this.sendEmail({
      to: email,
      subject: emailConfig.templates.welcomeStudent.subject,
      html,
    });
  }

  /**
   * Send welcome email to patient
   */
  async sendWelcomePatient(email: string, name: string): Promise<void> {
    const html = `
      <h1>Bienvenue à CRM Pro.cc, ${name}!</h1>
      <p>Votre dossier patient a été créé avec succès.</p>
      <p>Vous pouvez maintenant prendre rendez-vous en ligne.</p>
      <p>Accédez à votre espace patient: <a href="http://localhost:5174">CRM Pro.cc</a></p>
    `;

    await this.sendEmail({
      to: email,
      subject: emailConfig.templates.welcomePatient.subject,
      html,
    });
  }

  /**
   * Send appointment confirmation
   */
  async sendAppointmentConfirmation(
    email: string,
    patientName: string,
    appointmentDetails: any
  ): Promise<void> {
    const html = `
      <h1>Confirmation de rendez-vous</h1>
      <p>Bonjour ${patientName},</p>
      <p>Votre rendez-vous a été confirmé:</p>
      <ul>
        <li>Date: ${appointmentDetails.date}</li>
        <li>Heure: ${appointmentDetails.time}</li>
        <li>Médecin: ${appointmentDetails.doctor}</li>
        <li>Type: ${appointmentDetails.type}</li>
      </ul>
      <p>Merci de vous présenter 15 minutes avant l'heure du rendez-vous.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: emailConfig.templates.appointmentConfirmation.subject,
      html,
    });
  }

  /**
   * Send payment receipt
   */
  async sendPaymentReceipt(
    email: string,
    name: string,
    receiptDetails: any
  ): Promise<void> {
    const html = `
      <h1>Reçu de paiement</h1>
      <p>Bonjour ${name},</p>
      <p>Nous avons bien reçu votre paiement.</p>
      <p><strong>Détails:</strong></p>
      <ul>
        <li>Montant: ${receiptDetails.amount} MAD</li>
        <li>Date: ${receiptDetails.date}</li>
        <li>Référence: ${receiptDetails.reference}</li>
        <li>Type: ${receiptDetails.type}</li>
      </ul>
      <p>Merci de votre confiance.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: emailConfig.templates.paymentReceipt.subject,
      html,
      attachments: receiptDetails.pdfAttachment ? [
        {
          filename: 'recu.pdf',
          content: receiptDetails.pdfAttachment,
        }
      ] : undefined,
    });
  }

  /**
   * Send password reset email
   */
  async sendPasswordReset(email: string, resetToken: string): Promise<void> {
    const resetUrl = `http://localhost:5173/reset-password?token=${resetToken}`;

    const html = `
      <h1>Réinitialisation de mot de passe</h1>
      <p>Vous avez demandé à réinitialiser votre mot de passe.</p>
      <p>Cliquez sur le lien ci-dessous pour créer un nouveau mot de passe:</p>
      <p><a href="${resetUrl}">Réinitialiser mon mot de passe</a></p>
      <p>Ce lien expire dans 1 heure.</p>
      <p>Si vous n'avez pas demandé cette réinitialisation, ignorez cet email.</p>
    `;

    await this.sendEmail({
      to: email,
      subject: emailConfig.templates.passwordReset.subject,
      html,
    });
  }
}

export const emailService = new EmailService();

// ==========================================
// src/services/user.service.ts
// ==========================================

import { Prisma } from '@prisma/client';

class UserService {
  /**
   * Get user by ID
   */
  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organization: true,
        isActive: true,
        isVerified: true,
        lastLogin: true,
        createdAt: true,
      },
    });

    if (!user) {
      throw new NotFoundError('Utilisateur');
    }

    return user;
  }

  /**
   * Get user by email
   */
  async getUserByEmail(email: string) {
    return await prisma.user.findUnique({
      where: { email },
    });
  }

  /**
   * Update user
   */
  async updateUser(id: string, data: Prisma.UserUpdateInput) {
    return await prisma.user.update({
      where: { id },
      data,
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        organization: true,
      },
    });
  }

  /**
   * Delete user
   */
  async deleteUser(id: string) {
    await prisma.user.delete({
      where: { id },
    });
  }

  /**
   * Get all users with pagination
   */
  async getUsers(page: number = 1, limit: number = 10, filters?: any) {
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {};

    if (filters?.organization) {
      where.organization = filters.organization;
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { firstName: { contains: filters.search, mode: 'insensitive' } },
        { lastName: { contains: filters.search, mode: 'insensitive' } },
      ];
    }

    const [users, total] = await Promise.all([
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          role: true,
          organization: true,
          isActive: true,
          lastLogin: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.user.count({ where }),
    ]);

    return {
      users,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}

export const userService = new UserService();
