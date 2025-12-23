// ==========================================
// src/middleware/auth.middleware.ts
// ==========================================

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { jwtConfig } from '../config/jwt.config.js';
import { prisma } from '../config/database.config.js';
import { logger } from '../utils/logger.js';
import { AppError } from '../utils/errors.js';

// Extend Express Request type
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
        organization?: string;
      };
    }
  }
}

/**
 * Verify JWT token and attach user to request
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new AppError('Token manquant ou invalide', 401);
    }
    
    const token = authHeader.substring(7);
    
    // Verify token
    const decoded = jwt.verify(token, jwtConfig.secret) as {
      userId: string;
      email: string;
      role: string;
      organization?: string;
    };
    
    // Check if user exists and is active
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        role: true,
        organization: true,
        isActive: true,
      },
    });
    
    if (!user || !user.isActive) {
      throw new AppError('Utilisateur non trouvé ou inactif', 401);
    }
    
    // Attach user to request
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      organization: user.organization || undefined,
    };
    
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      next(new AppError('Token invalide', 401));
    } else if (error instanceof jwt.TokenExpiredError) {
      next(new AppError('Token expiré', 401));
    } else {
      next(error);
    }
  }
}

/**
 * Check if user has required role
 */
export function authorize(...roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }
    
    if (!roles.includes(req.user.role)) {
      throw new AppError('Accès non autorisé', 403);
    }
    
    next();
  };
}

/**
 * Check if user belongs to specific organization
 */
export function authorizeOrganization(org: 'school' | 'hospital') {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      throw new AppError('Non authentifié', 401);
    }
    
    if (req.user.organization !== org) {
      throw new AppError('Accès non autorisé pour cette organisation', 403);
    }
    
    next();
  };
}

// ==========================================
// src/middleware/error.middleware.ts
// ==========================================

import { AppError } from '../utils/errors.js';

/**
 * Global error handler
 */
export function errorHandler(
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  logger.error('Error:', {
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
  });
  
  // Operational errors
  if (err instanceof AppError) {
    res.status(err.statusCode).json({
      status: 'error',
      message: err.message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    });
    return;
  }
  
  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    res.status(401).json({
      status: 'error',
      message: 'Token invalide',
    });
    return;
  }
  
  if (err.name === 'TokenExpiredError') {
    res.status(401).json({
      status: 'error',
      message: 'Token expiré',
    });
    return;
  }
  
  // Validation errors
  if (err.name === 'ValidationError') {
    res.status(400).json({
      status: 'error',
      message: 'Erreur de validation',
      errors: (err as any).details,
    });
    return;
  }
  
  // Default error
  res.status(500).json({
    status: 'error',
    message: 'Erreur interne du serveur',
    ...(process.env.NODE_ENV === 'development' && {
      error: err.message,
      stack: err.stack,
    }),
  });
}

// ==========================================
// src/middleware/notFound.middleware.ts
// ==========================================

/**
 * 404 handler
 */
export function notFoundHandler(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  res.status(404).json({
    status: 'error',
    message: `Route ${req.originalUrl} introuvable`,
    method: req.method,
  });
}

// ==========================================
// src/middleware/validation.middleware.ts
// ==========================================

import { z, ZodError, ZodSchema } from 'zod';

/**
 * Validate request body against Zod schema
 */
export function validateBody(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.body = await schema.parseAsync(req.body);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Erreur de validation',
          errors: error.errors.map((err) => ({
            field: err.path.join('.'),
            message: err.message,
          })),
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request params
 */
export function validateParams(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.params = await schema.parseAsync(req.params);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Paramètres invalides',
          errors: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}

/**
 * Validate request query
 */
export function validateQuery(schema: ZodSchema) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      req.query = await schema.parseAsync(req.query);
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        res.status(400).json({
          status: 'error',
          message: 'Paramètres de requête invalides',
          errors: error.errors,
        });
      } else {
        next(error);
      }
    }
  };
}

// ==========================================
// src/middleware/logger.middleware.ts
// ==========================================

/**
 * Request logger middleware
 */
export function requestLogger(
  req: Request,
  res: Response,
  next: NextFunction
): void {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    
    logger.info('HTTP Request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration: `${duration}ms`,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    });
  });
  
  next();
}

// ==========================================
// src/middleware/upload.middleware.ts
// ==========================================

import multer from 'multer';
import path from 'path';
import { appConfig } from '../config/app.config.js';

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, appConfig.upload.uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

// File filter
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (appConfig.upload.allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Type de fichier non autorisé'));
  }
};

// Create multer instance
export const upload = multer({
  storage,
  limits: {
    fileSize: appConfig.upload.maxFileSize,
  },
  fileFilter,
});

/**
 * Handle multer errors
 */
export function handleUploadError(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  if (err instanceof multer.MulterError) {
    if (err.code === 'LIMIT_FILE_SIZE') {
      res.status(400).json({
        status: 'error',
        message: `Fichier trop volumineux. Taille maximale: ${appConfig.upload.maxFileSize / 1024 / 1024}MB`,
      });
      return;
    }
    
    res.status(400).json({
      status: 'error',
      message: err.message,
    });
    return;
  }
  
  next(err);
}

// ==========================================
// src/middleware/cache.middleware.ts
// ==========================================

import { redis, CACHE_TTL } from '../config/redis.config.js';

/**
 * Cache middleware
 */
export function cache(ttl: number = CACHE_TTL.MEDIUM) {
  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      next();
      return;
    }
    
    const key = `cache:${req.originalUrl}`;
    
    try {
      const cachedData = await redis.get(key);
      
      if (cachedData) {
        res.status(200).json(JSON.parse(cachedData));
        return;
      }
      
      // Store original send function
      const originalSend = res.json.bind(res);
      
      // Override send function
      res.json = function(data: any) {
        // Cache the response
        redis.setex(key, ttl, JSON.stringify(data));
        
        // Call original send
        return originalSend(data);
      };
      
      next();
    } catch (error) {
      logger.error('Cache error:', error);
      next();
    }
  };
}

/**
 * Clear cache by pattern
 */
export async function clearCache(pattern: string): Promise<void> {
  try {
    const keys = await redis.keys(pattern);
    
    if (keys.length > 0) {
      await redis.del(...keys);
      logger.info(`Cleared ${keys.length} cache keys matching: ${pattern}`);
    }
  } catch (error) {
    logger.error('Error clearing cache:', error);
  }
}

// ==========================================
// src/utils/errors.ts
// ==========================================

/**
 * Custom application error class
 */
export class AppError extends Error {
  public statusCode: number;
  public isOperational: boolean;
  
  constructor(message: string, statusCode: number = 500) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true;
    
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(resource: string = 'Resource') {
    super(`${resource} introuvable`, 404);
  }
}

/**
 * Validation Error
 */
export class ValidationError extends AppError {
  constructor(message: string = 'Erreur de validation') {
    super(message, 400);
  }
}

/**
 * Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Non authentifié') {
    super(message, 401);
  }
}

/**
 * Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Accès interdit') {
    super(message, 403);
  }
}

/**
 * Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflit de ressource') {
    super(message, 409);
  }
}
