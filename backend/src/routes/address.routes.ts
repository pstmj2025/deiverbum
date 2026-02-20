import { Router } from 'express';
import { AddressController } from '../controllers/address.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas as rotas requerem autenticação
router.use(authenticate);

router.get('/', AddressController.list);
router.get('/:id', AddressController.getById);
router.post('/', AddressController.create);
router.put('/:id', AddressController.update);
router.delete('/:id', AddressController.delete);

export { router as addressRouter };
