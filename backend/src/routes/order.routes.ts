import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

// Rotas autenticadas para clientes
router.use(authenticate);

router.post('/', OrderController.create);
router.get('/', OrderController.list);
router.get('/:id', OrderController.getById);
router.post('/:id/cancel', OrderController.cancel);

// Rotas administrativas
router.get('/admin/all', requireManagerOrAdmin, OrderController.adminList);
router.put('/:id/status', requireManagerOrAdmin, OrderController.updateStatus);

export { router as orderRouter };
