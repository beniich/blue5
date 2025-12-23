// ==========================================
// src/routes/auth.routes.ts
// ==========================================

import { Router } from 'express';
import { authController } from '../controllers/auth.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

/**
 * @route   POST /api/v1/auth/register
 * @desc    Register new user
 * @access  Public
 */
router.post('/register', (req, res, next) => authController.register(req, res, next));

/**
 * @route   POST /api/v1/auth/login
 * @desc    Login user
 * @access  Public
 */
router.post('/login', (req, res, next) => authController.login(req, res, next));

/**
 * @route   POST /api/v1/auth/refresh
 * @desc    Refresh access token
 * @access  Public
 */
router.post('/refresh', (req, res, next) => authController.refreshToken(req, res, next));

/**
 * @route   POST /api/v1/auth/logout
 * @desc    Logout user
 * @access  Public
 */
router.post('/logout', (req, res, next) => authController.logout(req, res, next));

/**
 * @route   GET /api/v1/auth/me
 * @desc    Get current user
 * @access  Private
 */
router.get('/me', authenticate, (req, res, next) => authController.getCurrentUser(req, res, next));

/**
 * @route   POST /api/v1/auth/reset-password-request
 * @desc    Request password reset
 * @access  Public
 */
router.post('/reset-password-request', (req, res, next) => 
  authController.requestPasswordReset(req, res, next)
);

/**
 * @route   POST /api/v1/auth/reset-password
 * @desc    Reset password
 * @access  Public
 */
router.post('/reset-password', (req, res, next) => authController.resetPassword(req, res, next));

/**
 * @route   GET /api/v1/auth/verify-email/:token
 * @desc    Verify email
 * @access  Public
 */
router.get('/verify-email/:token', (req, res, next) => authController.verifyEmail(req, res, next));

export default router;

// ==========================================
// src/routes/powerbi.routes.ts
// ==========================================

import { powerbiController } from '../controllers/powerbi.controller.js';
import { authorize, authorizeOrganization } from '../middleware/auth.middleware.js';

const router = Router();

// All Power BI routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/v1/powerbi/embed-token
 * @desc    Get Power BI embed token
 * @access  Private
 */
router.post('/embed-token', (req, res, next) => 
  powerbiController.getEmbedToken(req, res, next)
);

/**
 * @route   GET /api/v1/powerbi/reports/:organization
 * @desc    Get available reports for organization
 * @access  Private
 */
router.get('/reports/:organization', (req, res, next) => 
  powerbiController.getAvailableReports(req, res, next)
);

/**
 * @route   POST /api/v1/powerbi/datasets/:id/refresh
 * @desc    Refresh Power BI dataset
 * @access  Private (Admin only)
 */
router.post('/datasets/:id/refresh', authorize('ADMIN'), (req, res, next) => 
  powerbiController.refreshDataset(req, res, next)
);

/**
 * @route   POST /api/v1/powerbi/export/pdf
 * @desc    Export Power BI report to PDF
 * @access  Private
 */
router.post('/export/pdf', (req, res, next) => 
  powerbiController.exportToPDF(req, res, next)
);

export default router;
