// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { Decimal } from '@prisma/client/runtime/library';

// Gerar número de pedido
function generateOrderNumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const random = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `DEI-${year}${month}${day}-${random}`;
}

export class OrderController {
  // Criar pedido
  static async create(req: Request, res: Response) {
    const { 
      items, 
      addressId, 
      customerNote,
      couponCode,
    } = req.body;
    
    try {
      // Verificar endereço
      const address = await prisma.address.findFirst({
        where: { id: addressId, userId: req.user!.id },
      });
      
      if (!address) {
        return res.status(400).json({ error: 'Endereço não encontrado' });
      }
      
      // Buscar produtos e calcular valores
      let subtotal = 0;
      const orderItems: { productId: string; productName: string; productSku: string; productImage: any; quantity: number; price: Decimal; total: number; }[] = [];
      
      for (const item of items) {
        const product = await prisma.product.findUnique({
          where: { id: item.productId, active: true },
        });
        
        if (!product) {
          return res.status(400).json({ 
            error: `Produto ${item.productId} não encontrado` 
          });
        }
        
        if (product.stock < item.quantity) {
          return res.status(400).json({
            error: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}`,
          });
        }
        
        const itemTotal = Number(product.price) * item.quantity;
        subtotal += itemTotal;
        
        orderItems.push({
          productId: product.id,
          productName: product.name,
          productSku: product.sku,
          productImage: (product.images as any[])?.[0] || null,
          quantity: item.quantity,
          price: product.price,
          total: itemTotal,
        });
      }
      
      // Calcular frete (simplificado - pode ser integrado com correios)
      const shippingCost = subtotal > 200 ? 0 : 15;
      
      // Aplicar cupom se houver
      let discount = 0;
      
      const total = subtotal + shippingCost - discount;
      
      // Criar pedido com transaction
      const order = await prisma.$transaction(async (tx) => {
        // Criar pedido
        const newOrder = await tx.order.create({
          data: {
            orderNumber: generateOrderNumber(),
            userId: req.user!.id,
            addressId,
            subtotal,
            shippingCost,
            discount,
            total,
            status: 'PENDING',
            paymentStatus: 'PENDING',
            customerNote,
          },
        });
        
        // Criar itens do pedido e atualizar estoque
        for (const item of orderItems) {
          await tx.orderItem.create({
            data: {
              ...item,
              orderId: newOrder.id,
            },
          });
          
          // Atualizar estoque
          await tx.product.update({
            where: { id: item.productId },
            data: {
              stock: { decrement: item.quantity },
            },
          });
          
          // Registrar movimentação de saída
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: -item.quantity,
              type: 'OUT',
              note: `Venda pedido #${newOrder.orderNumber}`,
            },
          });
        }
        
        return newOrder;
      });
      
      const orderWithItems = await prisma.order.findUnique({
        where: { id: order.id },
        include: {
          items: true,
          address: true,
        },
      });
      
      res.status(201).json(orderWithItems);
    } catch (error) {
      console.error('Erro ao criar pedido:', error);
      res.status(500).json({ error: 'Erro ao criar pedido' });
    }
  }
  
  // Listar pedidos do usuário
  static async list(req: Request, res: Response) {
    try {
      const { page = '1', limit = '10' } = req.query;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where: { userId: req.user!.id },
          include: {
            items: {
              select: {
                productName: true,
                productImage: true,
                quantity: true,
                price: true,
              },
            },
            address: {
              select: {
                city: true,
                state: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.order.count({ where: { userId: req.user!.id } }),
      ]);
      
      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  }
  
  // Buscar pedido por ID
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const order = await prisma.order.findFirst({
        where: {
          id,
          userId: req.user!.id,
        },
        include: {
          items: true,
          address: true,
          payment: true,
        },
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      res.json(order);
    } catch (error) {
      console.error('Erro ao buscar pedido:', error);
      res.status(500).json({ error: 'Erro ao buscar pedido' });
    }
  }
  
  // Cancelar pedido
  static async cancel(req: Request, res: Response) {
    const { id } = req.params;
    const { reason } = req.body;
    
    try {
      const order = await prisma.order.findFirst({
        where: { id, userId: req.user!.id },
        include: { items: true },
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado' });
      }
      
      if (order.status !== 'PENDING') {
        return res.status(400).json({ 
          error: 'Apenas pedidos pendentes podem ser cancelados' 
        });
      }
      
      // Cancelar e restaurar estoque
      await prisma.$transaction(async (tx) => {
        // Atualizar status
        await tx.order.update({
          where: { id },
          data: { status: 'CANCELLED', internalNote: reason },
        });
        
        // Restaurar estoque
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stock: { increment: item.quantity } },
          });
          
          await tx.stockMovement.create({
            data: {
              productId: item.productId,
              quantity: item.quantity,
              type: 'RETURN',
              note: `Cancelamento pedido #${order.orderNumber}: ${reason}`,
            },
          });
        }
      });
      
      res.json({ message: 'Pedido cancelado com sucesso' });
    } catch (error) {
      console.error('Erro ao cancelar pedido:', error);
      res.status(500).json({ error: 'Erro ao cancelar pedido' });
    }
  }
  
  // Admin: Listar todos os pedidos
  static async adminList(req: Request, res: Response) {
    const { status, page = '1', limit = '20' } = req.query;
    
    try {
      const where: any = {};
      if (status) where.status = status;
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [orders, total] = await Promise.all([
        prisma.order.findMany({
          where,
          include: {
            user: { select: { name: true, email: true } },
            items: {
              select: {
                productName: true,
                quantity: true,
              },
            },
            address: {
              select: {
                city: true,
                state: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
          skip,
          take: Number(limit),
        }),
        prisma.order.count({ where }),
      ]);
      
      res.json({
        orders,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Erro ao listar pedidos:', error);
      res.status(500).json({ error: 'Erro ao listar pedidos' });
    }
  }
  
  // Admin: Atualizar status do pedido
  static async updateStatus(req: Request, res: Response) {
    const { id } = req.params;
    const { status, trackingCode, internalNote } = req.body;
    
    try {
      const updateData: any = {};
      
      if (status) {
        updateData.status = status;
        
        if (status === 'SHIPPED') {
          updateData.trackingCode = trackingCode;
          updateData.shippedAt = new Date();
        }
        
        if (status === 'DELIVERED') {
          updateData.deliveredAt = new Date();
        }
      }
      
      if (internalNote !== undefined) {
        updateData.internalNote = internalNote;
      }
      
      const order = await prisma.order.update({
        where: { id },
        data: updateData,
      });
      
      res.json(order);
    } catch (error) {
      console.error('Erro ao atualizar pedido:', error);
      res.status(500).json({ error: 'Erro ao atualizar pedido' });
    }
  }
}