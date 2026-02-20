import { Router } from 'express';
import { CategoryController } from '../controllers/category.controller';
import { authenticate, requireManagerOrAdmin } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.get('/', CategoryController.list);
router.get('/:slug', CategoryController.getBySlug);

// Rotas administrativas
router.post('/', authenticate, requireManagerOrAdmin, CategoryController.create);
router.put('/:id', authenticate, requireManagerOrAdmin, CategoryController.update);
router.delete('/:id', authenticate, requireManagerOrAdmin, CategoryController.delete);

export { router as categoryRouter };
