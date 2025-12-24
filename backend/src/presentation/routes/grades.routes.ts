import { Router } from 'express';
import { GradesController } from '../controllers/GradesController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new GradesController();

router.use(authMiddleware);

router.get('/exams', (req, res) => controller.listExams(req, res));
router.post('/exams/:id/grades', (req, res) => controller.submitGrades(req, res));
router.get('/report-cards/:studentId', (req, res) => controller.getReportCard(req, res));

export default router;
