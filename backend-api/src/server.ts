// src/server.ts
// Backend API Principal - School 1cc & CRM Pro.cc

import express, { Application, Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import { config } from 'dotenv';
import rateLimit from 'express-rate-limit';

// Import configurations
import { appConfig } from './config/app.config.js';
import { corsOptions } from './config/cors.config.js';

// Import middleware
import { errorHandler } from './middleware/error.middleware.js';
import { notFoundHandler } from './middleware/notFound.middleware.js';
import { requestLogger } from './middleware/logger.middleware.js';

// Import routes
import authRoutes from './routes/auth.routes.js';
import powerbiRoutes from './routes/powerbi.routes.js';

// School routes
import studentRoutes from './routes/school/students.routes.js';
import teacherRoutes from './routes/school/teachers.routes.js';
import classRoutes from './routes/school/classes.routes.js';
import examRoutes from './routes/school/exams.routes.js';
import attendanceRoutes from './routes/school/attendance.routes.js';
import paymentRoutes from './routes/school/payments.routes.js';

// Hospital routes
import patientRoutes from './routes/hospital/patients.routes.js';
import doctorRoutes from './routes/hospital/doctors.routes.js';
import appointmentRoutes from './routes/hospital/appointments.routes.js';
import admissionRoutes from './routes/hospital/admissions.routes.js';
import bedRoutes from './routes/hospital/beds.routes.js';
import billingRoutes from './routes/hospital/billing.routes.js';

// Import utilities
import { logger } from './utils/logger.js';
import { connectDatabase } from './config/database.config.js';

// Load environment variables
config();

// Create Express app
const app: Application = express();
const PORT = process.env.PORT || 3001;
const API_VERSION = process.env.API_VERSION || 'v1';

// ==========================================
// Global Middleware
// ==========================================

// Security
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false,
}));

// CORS
app.use(cors(corsOptions));

// Compression
app.use(compression());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}
app.use(requestLogger);

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
  message: 'Trop de requêtes depuis cette IP, veuillez réessayer plus tard.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api/', limiter);

// ==========================================
// Health Check
// ==========================================

app.get('/health', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OK',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
    version: API_VERSION,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.status(200).json({
    message: 'School 1cc & CRM Pro.cc Backend API',
    version: API_VERSION,
    endpoints: {
      health: '/health',
      auth: `/api/${API_VERSION}/auth`,
      powerbi: `/api/${API_VERSION}/powerbi`,
      school: `/api/${API_VERSION}/school`,
      hospital: `/api/${API_VERSION}/hospital`,
    },
  });
});

// ==========================================
// API Routes
// ==========================================

const apiRouter = express.Router();

// Authentication routes
apiRouter.use('/auth', authRoutes);

// Power BI routes
apiRouter.use('/powerbi', powerbiRoutes);

// School routes
apiRouter.use('/school/students', studentRoutes);
apiRouter.use('/school/teachers', teacherRoutes);
apiRouter.use('/school/classes', classRoutes);
apiRouter.use('/school/exams', examRoutes);
apiRouter.use('/school/attendance', attendanceRoutes);
apiRouter.use('/school/payments', paymentRoutes);

// Hospital routes
apiRouter.use('/hospital/patients', patientRoutes);
apiRouter.use('/hospital/doctors', doctorRoutes);
apiRouter.use('/hospital/appointments', appointmentRoutes);
apiRouter.use('/hospital/admissions', admissionRoutes);
apiRouter.use('/hospital/beds', bedRoutes);
apiRouter.use('/hospital/billing', billingRoutes);

// Mount API router
app.use(`/api/${API_VERSION}`, apiRouter);

// ==========================================
// Error Handling
// ==========================================

// 404 handler
app.use(notFoundHandler);

// Global error handler
app.use(errorHandler);

// ==========================================
// Start Server
// ==========================================

async function startServer() {
  try {
    // Connect to database
    await connectDatabase();
    logger.info('Database connected successfully');

    // Start listening
    app.listen(PORT, () => {
      logger.info(`
        ╔════════════════════════════════════════════════════╗
        ║   Server started successfully!                     ║
        ║   Environment: ${process.env.NODE_ENV?.padEnd(35)}║
        ║   Port: ${PORT.toString().padEnd(42)}║
        ║   API Version: ${API_VERSION.padEnd(37)}║
        ║   URL: http://localhost:${PORT}${' '.repeat(24)}║
        ╚════════════════════════════════════════════════════╝
      `);
    });

    // Graceful shutdown
    process.on('SIGTERM', gracefulShutdown);
    process.on('SIGINT', gracefulShutdown);
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
}

async function gracefulShutdown(signal: string) {
  logger.info(`${signal} signal received: closing HTTP server`);
  
  // Close server
  process.exit(0);
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason: Error, promise: Promise<any>) => {
  logger.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

// Handle uncaught exceptions
process.on('uncaughtException', (error: Error) => {
  logger.error('Uncaught Exception:', error);
  process.exit(1);
});

// Start the server
startServer();

export default app;
