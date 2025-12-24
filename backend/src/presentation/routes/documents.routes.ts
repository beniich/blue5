import { Router } from 'express';
import { DocumentsController } from '../controllers/DocumentsController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new DocumentsController();

// All routes require authentication
router.use(authMiddleware);

/**
 * @route POST /api/v1/documents/upload
 * @desc Upload document
 * @access Private
 */
router.post('/upload', (req, res) => controller.upload(req, res));

/**
 * @route POST /api/v1/documents/folders
 * @desc Create folder
 * @access Private
 */
router.post('/folders', (req, res) => controller.createFolder(req, res));

/**
 * @route GET /api/v1/documents
 * @desc List documents
 * @access Private
 */
router.get('/', (req, res) => controller.list(req, res));

/**
 * @route DELETE /api/v1/documents/:id
 * @desc Archive document
 * @access Private
 */
router.delete('/:id', (req, res) => controller.delete(req, res));

export default router;
