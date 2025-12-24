import { Router } from 'express';
import { AuthController } from '../controllers/AuthController';

const router = Router();
const authController = new AuthController();

/**
 * @route POST /api/v1/auth/login
 * @desc Login user
 * @access Public
 */
router.post('/login', (req, res) => authController.login(req, res));

/**
 * @route POST /api/v1/auth/logout
 * @desc Logout user
 * @access Private
 */
router.post('/logout', (req, res) => authController.logout(req, res));

/**
 * @route POST /api/v1/auth/refresh
 * @desc Refresh token
 * @access Public
 */
router.post('/refresh', (req, res) => authController.refresh(req, res));

export default router;
