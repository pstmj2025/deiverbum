import { Router } from 'express';
import {
  createVendor,
  listVendors,
  assignManager,
  updateVendor,
  getVendorDashboard,
} from '../controllers/vendor.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Todas as rotas precisam de autenticação
router.use(authenticate);

// Listar lojas (ADMIN vê todas, MANAGER vê apenas a sua)
router.get('/', listVendors);

// Criar nova loja (apenas ADMIN)
router.post('/', createVendor);

// Dashboard da loja
router.get('/:id/dashboard', getVendorDashboard);

// Atualizar loja
router.put('/:id', updateVendor);

// Associar gerente à loja (apenas ADMIN)
router.post('/:vendorId/managers', assignManager);

export { router as vendorRouter };
