// ==========================================
// src/config/app.config.ts
// ==========================================

export const appConfig = {
  nodeEnv: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT || '3001', 10),
  apiVersion: process.env.API_VERSION || 'v1',
  
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  isTest: process.env.NODE_ENV === 'test',
  
  app: {
    name: 'School 1cc & CRM Pro.cc API',
    version: '1.0.0',
    description: 'Backend API with Power BI integration',
  },
  
  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'),
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  },
  
  upload: {
    maxFileSize: parseInt(process.env.MAX_FILE_SIZE || '10485760'), // 10MB
    uploadDir: process.env.UPLOAD_DIR || './uploads',
    allowedMimeTypes: [
      'image/jpeg',
      'image/png',
      'image/gif',
      'image/webp',
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ],
  },
} as const;

// ==========================================
// src/config/cors.config.ts
// ==========================================

import { CorsOptions } from 'cors';

const allowedOrigins = process.env.CORS_ORIGIN?.split(',') || [
  'http://localhost:5173',
  'http://localhost:5174',
];

export const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, Postman, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'Accept',
  ],
  exposedHeaders: ['X-Total-Count', 'X-Page-Count'],
  maxAge: 86400, // 24 hours
};

// ==========================================
// src/config/database.config.ts
// ==========================================

import { PrismaClient } from '@prisma/client';
import { logger } from '../utils/logger.js';

// Create Prisma client instance
export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' 
    ? ['query', 'error', 'warn']
    : ['error'],
});

// Connect to database
export async function connectDatabase(): Promise<void> {
  try {
    await prisma.$connect();
    logger.info('✅ Database connected successfully');
  } catch (error) {
    logger.error('❌ Database connection failed:', error);
    throw error;
  }
}

// Disconnect from database
export async function disconnectDatabase(): Promise<void> {
  try {
    await prisma.$disconnect();
    logger.info('Database disconnected');
  } catch (error) {
    logger.error('Error disconnecting from database:', error);
    throw error;
  }
}

// Handle Prisma errors
export function handlePrismaError(error: any): { status: number; message: string } {
  if (error.code === 'P2002') {
    return {
      status: 409,
      message: 'Un enregistrement avec ces valeurs existe déjà',
    };
  }
  
  if (error.code === 'P2025') {
    return {
      status: 404,
      message: 'Enregistrement introuvable',
    };
  }
  
  if (error.code === 'P2003') {
    return {
      status: 400,
      message: 'Référence invalide',
    };
  }
  
  return {
    status: 500,
    message: 'Erreur de base de données',
  };
}

// ==========================================
// src/config/supabase.config.ts
// ==========================================

import { createClient } from '@supabase/supabase-js';

if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
  {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
    },
  }
);

// Supabase storage bucket names
export const STORAGE_BUCKETS = {
  AVATARS: 'avatars',
  DOCUMENTS: 'documents',
  MEDICAL_RECORDS: 'medical-records',
  RECEIPTS: 'receipts',
} as const;

// ==========================================
// src/config/powerbi.config.ts
// ==========================================

import * as msal from '@azure/msal-node';

if (!process.env.POWERBI_CLIENT_ID || 
    !process.env.POWERBI_CLIENT_SECRET || 
    !process.env.POWERBI_TENANT_ID) {
  throw new Error('Missing Power BI environment variables');
}

// MSAL configuration
export const msalConfig: msal.Configuration = {
  auth: {
    clientId: process.env.POWERBI_CLIENT_ID,
    authority: process.env.POWERBI_AUTHORITY || 
      `https://login.microsoftonline.com/${process.env.POWERBI_TENANT_ID}`,
    clientSecret: process.env.POWERBI_CLIENT_SECRET,
  },
};

// Create MSAL client
export const msalClient = new msal.ConfidentialClientApplication(msalConfig);

// Power BI configuration
export const powerbiConfig = {
  apiUrl: 'https://api.powerbi.com/v1.0/myorg',
  scopes: ['https://analysis.windows.net/powerbi/api/.default'],
  
  // School 1cc workspaces and reports
  school: {
    workspaceId: process.env.SCHOOL_WORKSPACE_ID || '',
    reports: {
      dashboard: process.env.SCHOOL_DASHBOARD_REPORT_ID || '',
      students: process.env.SCHOOL_STUDENTS_REPORT_ID || '',
      finance: process.env.SCHOOL_FINANCE_REPORT_ID || '',
      exams: process.env.SCHOOL_EXAMS_REPORT_ID || '',
    },
  },
  
  // CRM Pro.cc workspaces and reports
  crm: {
    workspaceId: process.env.CRM_WORKSPACE_ID || '',
    reports: {
      dashboard: process.env.CRM_DASHBOARD_REPORT_ID || '',
      patients: process.env.CRM_PATIENTS_REPORT_ID || '',
      billing: process.env.CRM_BILLING_REPORT_ID || '',
      staff: process.env.CRM_STAFF_REPORT_ID || '',
    },
  },
} as const;

// ==========================================
// src/config/jwt.config.ts
// ==========================================

export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'your-super-secret-jwt-key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'your-refresh-secret',
  expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  refreshExpiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
  
  algorithm: 'HS256' as const,
  issuer: 'school-crm-api',
  audience: 'school-crm-frontend',
} as const;

// ==========================================
// src/config/email.config.ts
// ==========================================

import nodemailer from 'nodemailer';

export const emailTransporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.EMAIL_PORT || '587'),
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const emailConfig = {
  from: {
    name: 'School 1cc & CRM Pro.cc',
    address: process.env.EMAIL_USER || 'noreply@example.com',
  },
  
  templates: {
    welcomeStudent: {
      subject: 'Bienvenue à School 1cc',
      template: 'welcome-student',
    },
    welcomePatient: {
      subject: 'Bienvenue à CRM Pro.cc',
      template: 'welcome-patient',
    },
    appointmentConfirmation: {
      subject: 'Confirmation de rendez-vous',
      template: 'appointment-confirmation',
    },
    paymentReceipt: {
      subject: 'Reçu de paiement',
      template: 'payment-receipt',
    },
    passwordReset: {
      subject: 'Réinitialisation de mot de passe',
      template: 'password-reset',
    },
  },
} as const;

// ==========================================
// src/config/redis.config.ts
// ==========================================

import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

// Create Redis client
export const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: parseInt(process.env.REDIS_PORT || '6379'),
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
});

// Redis event handlers
redis.on('connect', () => {
  logger.info('✅ Redis connected');
});

redis.on('error', (err) => {
  logger.error('❌ Redis error:', err);
});

redis.on('close', () => {
  logger.warn('⚠️ Redis connection closed');
});

// Cache TTL constants (in seconds)
export const CACHE_TTL = {
  SHORT: 300,      // 5 minutes
  MEDIUM: 1800,    // 30 minutes
  LONG: 3600,      // 1 hour
  VERY_LONG: 86400, // 24 hours
} as const;

// Cache key prefixes
export const CACHE_KEYS = {
  USER: 'user:',
  STUDENT: 'student:',
  TEACHER: 'teacher:',
  PATIENT: 'patient:',
  DOCTOR: 'doctor:',
  POWERBI_TOKEN: 'powerbi:token:',
  SESSION: 'session:',
} as const;

// ==========================================
// src/config/stripe.config.ts
// ==========================================

import Stripe from 'stripe';

if (!process.env.STRIPE_SECRET_KEY) {
  throw new Error('Missing Stripe secret key');
}

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia',
  typescript: true,
});

export const stripeConfig = {
  webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
  currency: 'mad', // Moroccan Dirham
  
  paymentMethods: ['card', 'bank_transfer'],
  
  successUrl: process.env.STRIPE_SUCCESS_URL || 'http://localhost:5173/payment/success',
  cancelUrl: process.env.STRIPE_CANCEL_URL || 'http://localhost:5173/payment/cancel',
} as const;
