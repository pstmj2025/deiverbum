import { Request, Response } from 'express';
import { PrismaClient, UserRole } from '@prisma/client';

const prisma = new PrismaClient();

// ============ VENDORS (LOJAS PARCEIRAS) ============

// Criar nova loja parceira (apenas ADMIN)
export async function createVendor(req: Request, res: Response) {
  try {
    const { name, email, phone, document, commissionRate, address } = req.body;
    
    // Verificar se usuário é admin
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    if (user?.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Apenas administradores podem criar lojas' });
    }

    // Criar vendor
    const vendor = await prisma.vendor.create({
      data: {
        name,
        email,
        phone,
        document,
        commissionRate: commissionRate || 10.00,
        address: address ? JSON.stringify(address) : null,
        active: true,
        verified: false,
      },
    });

    res.status(201).json({ 
      success: true, 
      message: 'Loja parceira criada com sucesso',
      vendor 
    });
  } catch (error: any) {
    console.error('Erro ao criar vendor:', error);
    res.status(500).json({ error: error.message });
  }
}

// Listar todas as lojas (ADMIN vê todas, MANAGER vê apenas a sua)
export async function listVendors(req: Request, res: Response) {
  try {
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    let vendors;
    
    if (user?.role === UserRole.ADMIN) {
      // Admin vê todas
      vendors = await prisma.vendor.findMany({
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true }
          },
          _count: {
            select: { users: true }
          }
        }
      });
    } else if (user?.role === UserRole.MANAGER) {
      // Manager vê apenas onde está associado
      vendors = await prisma.vendor.findMany({
        where: { users: { some: { id: userId } } },
        include: {
          users: {
            select: { id: true, name: true, email: true, role: true }
          }
        }
      });
    } else {
      return res.status(403).json({ error: 'Sem permissão' });
    }

    res.json({ success: true, vendors });
  } catch (error: any) {
    console.error('Erro ao listar vendors:', error);
    res.status(500).json({ error: error.message });
  }
}

// Associar gerente à loja (apenas ADMIN)
export async function assignManager(req: Request, res: Response) {
  try {
    const { vendorId } = req.params;
    const { userId } = req.body;
    
    // Verificar se é admin
    const adminId = (req as any).user?.id;
    const admin = await prisma.user.findUnique({ where: { id: adminId } });
    
    if (admin?.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Apenas administradores' });
    }

    // Verificar se usuário existe
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: 'Usuário não encontrado' });
    }

    // Atualizar usuário para MANAGER e associar ao vendor
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        role: UserRole.MANAGER,
        vendorId: vendorId,
      },
      select: { id: true, name: true, email: true, role: true, vendorId: true }
    });

    res.json({ 
      success: true, 
      message: 'Gerente associado com sucesso',
      user: updatedUser 
    });
  } catch (error: any) {
    console.error('Erro ao associar gerente:', error);
    res.status(500).json({ error: error.message });
  }
}

// Atualizar loja
export async function updateVendor(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const { name, phone, document, commissionRate, active } = req.body;
    
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Verificar permissão
    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: { users: { select: { id: true } } }
    });
    
    if (!vendor) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }
    
    // Admin pode editar qualquer uma, Manager apenas a sua
    const isManagerOfThisVendor = vendor.users.some(u => u.id === userId);
    if (user?.role !== UserRole.ADMIN && !isManagerOfThisVendor) {
      return res.status(403).json({ error: 'Sem permissão para editar esta loja' });
    }

    const updatedVendor = await prisma.vendor.update({
      where: { id },
      data: { name, phone, document, commissionRate, active },
    });

    res.json({ success: true, vendor: updatedVendor });
  } catch (error: any) {
    console.error('Erro ao atualizar vendor:', error);
    res.status(500).json({ error: error.message });
  }
}

// Dashboard da loja (produtos, vendas, etc)
export async function getVendorDashboard(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const userId = (req as any).user?.id;
    const user = await prisma.user.findUnique({ where: { id: userId } });
    
    // Verificar permissão
    if (user?.role === UserRole.CUSTOMER) {
      return res.status(403).json({ error: 'Sem permissão' });
    }
    
    // Se for manager, só pode ver sua própria loja
    if (user?.role === UserRole.MANAGER && user.vendorId !== id) {
      return res.status(403).json({ error: 'Só pode ver sua própria loja' });
    }

    const vendor = await prisma.vendor.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true } },
        _count: {
          select: { users: true }
        }
      }
    });

    if (!vendor) {
      return res.status(404).json({ error: 'Loja não encontrada' });
    }

    // Contar produtos deste vendor
    const productsCount = await prisma.product.count({
      where: { vendorId: id }
    });

    // Calcular vendas totais (orders com produtos deste vendor)
    const orderItems = await prisma.orderItem.findMany({
      where: { product: { vendorId: id } },
      include: { order: true }
    });
    
    const totalSales = orderItems.reduce((sum, item) => sum + Number(item.total), 0);
    const totalOrders = new Set(orderItems.map(item => item.orderId)).size;

    res.json({
      success: true,
      vendor,
      stats: {
        productsCount,
        totalSales,
        totalOrders,
        managersCount: vendor._count.users
      }
    });
  } catch (error: any) {
    console.error('Erro no dashboard:', error);
    res.status(500).json({ error: error.message });
  }
}
