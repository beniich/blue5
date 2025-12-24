import { Router } from 'express';
import { TimetableController } from '../controllers/TimetableController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new TimetableController();

router.use(authMiddleware);

router.get('/', (req, res) => controller.getTimetable(req, res));
router.post('/sessions', (req, res) => controller.createSession(req, res));

export default router;
