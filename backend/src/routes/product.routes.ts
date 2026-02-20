import { Router } from 'express';
import { ProductController } from '../controllers/product.controller';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.get('/', ProductController.list);
router.get('/featured', ProductController.featured);
router.get('/:slug', ProductController.getBySlug);

// Rotas administrativas
router.post('/', authenticate, requireManagerOrAdmin, ProductController.create);
router.put('/:id', authenticate, requireManagerOrAdmin, ProductController.update);
router.delete('/:id', authenticate, requireManagerOrAdmin, ProductController.delete);
router.post('/:id/stock', authenticate, requireManagerOrAdmin, ProductController.updateStock);

export { router as productRouter };
