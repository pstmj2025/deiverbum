import { Router } from 'express';
import { PrismaClient, UserRole, ProductCondition, ProductType } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();
const router = Router();

// Endpoint temporário para seed (remover em produção)
router.post('/', async (req, res) => {
  try {
    console.log('🌱 Iniciando seed via API...');

    // ============ USUÁRIOS ============
    const adminPassword = await bcrypt.hash('admin123', 10);
    const customerPassword = await bcrypt.hash('123456', 10);

    await prisma.user.upsert({
      where: { email: 'admin@deiverbum.com.br' },
      update: {},
      create: {
        email: 'admin@deiverbum.com.br',
        password: adminPassword,
        name: 'Administrador',
        phone: '(62) 99999-9999',
        role: UserRole.ADMIN,
        active: true,
      },
    });

    await prisma.user.upsert({
      where: { email: 'gerente@deiverbum.com.br' },
      update: {},
      create: {
        email: 'gerente@deiverbum.com.br',
        password: adminPassword,
        name: 'Gerente da Loja',
        phone: '(62) 98888-8888',
        role: UserRole.MANAGER,
        active: true,
      },
    });

    await prisma.user.upsert({
      where: { email: 'cliente@email.com' },
      update: {},
      create: {
        email: 'cliente@email.com',
        password: customerPassword,
        name: 'Maria Silva',
        phone: '(62) 97777-7777',
        role: UserRole.CUSTOMER,
        active: true,
      },
    });

    res.json({ 
      success: true, 
      message: 'Seed executado com sucesso!',
      credentials: {
        admin: { email: 'admin@deiverbum.com.br', password: 'admin123' },
        gerente: { email: 'gerente@deiverbum.com.br', password: 'admin123' },
        cliente: { email: 'cliente@email.com', password: '123456' }
      }
    });
  } catch (error: any) {
    console.error('❌ Erro no seed:', error);
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as seedRouter };
