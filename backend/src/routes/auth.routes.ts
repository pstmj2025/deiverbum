import { Router } from 'express';
import { AuthController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth';

const router = Router();

// Rotas públicas
router.post('/register', AuthController.register);
router.post('/login', AuthController.login);

// Criar admin (apenas em desenvolvimento - remover em produção)
router.post('/setup-admin', AuthController.createAdmin);

// Rotas autenticadas
router.get('/profile', authenticate, AuthController.getProfile);
router.put('/profile', authenticate, AuthController.updateProfile);
router.put('/password', authenticate, AuthController.changePassword);

export { router as authRouter };
