import { Router } from 'express';
import { PaymentController } from '../controllers/payment.controller';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

// Rotas autenticadas
router.post('/initiate', authenticate, PaymentController.initiate);
router.get('/:id/status', authenticate, PaymentController.status);

// Webhooks (públicos)
router.post('/webhook/asaas', PaymentController.asaasWebhook);
router.post('/webhook/stripe', PaymentController.stripeWebhook);

export { router as paymentRouter };
