import { Router } from 'express';
import { BillingController } from '../controllers/BillingController';
import { authMiddleware } from '../middlewares/auth.middleware';

const router = Router();
const controller = new BillingController();

router.use(authMiddleware);

router.post('/invoices', (req, res) => controller.createInvoice(req, res));
router.get('/invoices', (req, res) => controller.listInvoices(req, res));
router.get('/stats', (req, res) => controller.getStats(req, res));

export default router;
