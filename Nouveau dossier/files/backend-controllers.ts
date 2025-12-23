// ==========================================
// src/controllers/auth.controller.ts
// ==========================================

import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service.js';
import { emailService } from '../services/email.service.js';
import { z } from 'zod';

// Validation schemas
const registerSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
  firstName: z.string().min(2, 'Le prénom doit contenir au moins 2 caractères'),
  lastName: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  role: z.enum(['USER', 'ADMIN', 'TEACHER', 'STUDENT', 'PARENT', 'DOCTOR', 'NURSE', 'SECRETARY', 'BILLING']).optional(),
  organization: z.enum(['school', 'hospital']).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email invalide'),
  password: z.string().min(1, 'Le mot de passe est requis'),
});

const refreshTokenSchema = z.object({
  refreshToken: z.string().min(1, 'Le token de rafraîchissement est requis'),
});

const resetPasswordRequestSchema = z.object({
  email: z.string().email('Email invalide'),
});

const resetPasswordSchema = z.object({
  token: z.string().min(1, 'Le token est requis'),
  password: z.string().min(8, 'Le mot de passe doit contenir au moins 8 caractères'),
});

export class AuthController {
  /**
   * Register new user
   * POST /api/v1/auth/register
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = registerSchema.parse(req.body);
      
      const result = await authService.register(data);
      
      res.status(201).json({
        status: 'success',
        message: 'Utilisateur créé avec succès',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login user
   * POST /api/v1/auth/login
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email, password } = loginSchema.parse(req.body);
      
      const result = await authService.login(email, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Connexion réussie',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh access token
   * POST /api/v1/auth/refresh
   */
  async refreshToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = refreshTokenSchema.parse(req.body);
      
      const result = await authService.refreshToken(refreshToken);
      
      res.status(200).json({
        status: 'success',
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Logout user
   * POST /api/v1/auth/logout
   */
  async logout(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { refreshToken } = req.body;
      
      if (refreshToken) {
        await authService.logout(refreshToken);
      }
      
      res.status(200).json({
        status: 'success',
        message: 'Déconnexion réussie',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get current user
   * GET /api/v1/auth/me
   */
  async getCurrentUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      res.status(200).json({
        status: 'success',
        data: {
          user: req.user,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Request password reset
   * POST /api/v1/auth/reset-password-request
   */
  async requestPasswordReset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { email } = resetPasswordRequestSchema.parse(req.body);
      
      const resetToken = await authService.requestPasswordReset(email);
      
      // Send reset email
      await emailService.sendPasswordReset(email, resetToken);
      
      res.status(200).json({
        status: 'success',
        message: 'Si un compte existe avec cet email, un lien de réinitialisation a été envoyé',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Reset password
   * POST /api/v1/auth/reset-password
   */
  async resetPassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token, password } = resetPasswordSchema.parse(req.body);
      
      await authService.resetPassword(token, password);
      
      res.status(200).json({
        status: 'success',
        message: 'Mot de passe réinitialisé avec succès',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Verify email
   * GET /api/v1/auth/verify-email/:token
   */
  async verifyEmail(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { token } = req.params;
      
      // Verify token and get user ID
      // Implementation depends on your verification flow
      
      res.status(200).json({
        status: 'success',
        message: 'Email vérifié avec succès',
      });
    } catch (error) {
      next(error);
    }
  }
}

export const authController = new AuthController();

// ==========================================
// src/controllers/powerbi.controller.ts
// ==========================================

import { powerbiService } from '../services/powerbi.service.js';

const embedConfigSchema = z.object({
  organization: z.enum(['school', 'crm']),
  reportType: z.string(),
});

const exportSchema = z.object({
  workspaceId: z.string(),
  reportId: z.string(),
});

export class PowerBIController {
  /**
   * Get embed token
   * POST /api/v1/powerbi/embed-token
   */
  async getEmbedToken(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organization, reportType } = embedConfigSchema.parse(req.body);
      
      const config = await powerbiService.getEmbedConfig(
        organization,
        reportType,
        req.user?.email
      );
      
      res.status(200).json({
        status: 'success',
        data: config,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available reports
   * GET /api/v1/powerbi/reports/:organization
   */
  async getAvailableReports(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { organization } = req.params;
      
      if (organization !== 'school' && organization !== 'crm') {
        throw new AppError('Organisation invalide', 400);
      }
      
      const reports = powerbiService.getAvailableReports(organization);
      
      res.status(200).json({
        status: 'success',
        data: {
          organization,
          reports,
        },
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Refresh dataset
   * POST /api/v1/powerbi/datasets/:id/refresh
   */
  async refreshDataset(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workspaceId, datasetId } = req.body;
      
      await powerbiService.refreshDataset(workspaceId, datasetId);
      
      res.status(200).json({
        status: 'success',
        message: 'Actualisation du dataset lancée',
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Export report to PDF
   * POST /api/v1/powerbi/export/pdf
   */
  async exportToPDF(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { workspaceId, reportId } = exportSchema.parse(req.body);
      
      const pdfBuffer = await powerbiService.exportToPDF(workspaceId, reportId);
      
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="report-${reportId}.pdf"`);
      res.send(pdfBuffer);
    } catch (error) {
      next(error);
    }
  }
}

export const powerbiController = new PowerBIController();

// ==========================================
// src/utils/logger.ts
// ==========================================

import winston from 'winston';
import { appConfig } from '../config/app.config.js';

// Define log format
const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.splat(),
  winston.format.json()
);

// Create logger
export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: logFormat,
  defaultMeta: { service: 'school-crm-api' },
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          ({ level, message, timestamp, ...meta }) => {
            let msg = `${timestamp} [${level}]: ${message}`;
            if (Object.keys(meta).length > 0) {
              msg += ` ${JSON.stringify(meta)}`;
            }
            return msg;
          }
        )
      ),
    }),
  ],
});

// Add file transport in production
if (appConfig.isProduction) {
  logger.add(
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );

  logger.add(
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    })
  );
}

// ==========================================
// src/utils/bcrypt.utils.ts
// ==========================================

import bcrypt from 'bcryptjs';

const SALT_ROUNDS = 10;

/**
 * Hash password
 */
export async function hashPassword(password: string): Promise<string> {
  return await bcrypt.hash(password, SALT_ROUNDS);
}

/**
 * Compare password with hash
 */
export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return await bcrypt.compare(password, hash);
}

// ==========================================
// src/utils/validator.utils.ts
// ==========================================

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate phone number (Moroccan format)
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^(\+212|0)[5-7]\d{8}$/;
  return phoneRegex.test(phone.replace(/[\s-]/g, ''));
}

/**
 * Validate password strength
 */
export function isStrongPassword(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Le mot de passe doit contenir au moins 8 caractères');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une majuscule');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins une minuscule');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un chiffre');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Le mot de passe doit contenir au moins un caractère spécial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize string (prevent XSS)
 */
export function sanitizeString(str: string): string {
  return str
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
    .replace(/\//g, '&#x2F;');
}

/**
 * Generate random string
 */
export function generateRandomString(length: number = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  
  return result;
}

/**
 * Format date to ISO string
 */
export function formatDateISO(date: Date): string {
  return date.toISOString();
}

/**
 * Parse date from various formats
 */
export function parseDate(dateString: string): Date | null {
  try {
    const date = new Date(dateString);
    return isNaN(date.getTime()) ? null : date;
  } catch {
    return null;
  }
}

/**
 * Calculate age from birth date
 */
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  return age;
}

/**
 * Format currency (MAD)
 */
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('fr-MA', {
    style: 'currency',
    currency: 'MAD',
  }).format(amount);
}

/**
 * Pagination helper
 */
export function getPagination(page: number, limit: number) {
  const skip = (page - 1) * limit;
  return { skip, take: limit };
}

/**
 * Calculate pagination metadata
 */
export function getPaginationMetadata(
  page: number,
  limit: number,
  total: number
) {
  return {
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
    hasNextPage: page < Math.ceil(total / limit),
    hasPreviousPage: page > 1,
  };
}
