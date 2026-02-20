import { Request, Response } from 'express';
import { prisma } from '../config/database';

export class AddressController {
  // Listar endereços do usuário
  static async list(req: Request, res: Response) {
    try {
      const addresses = await prisma.address.findMany({
        where: { userId: req.user!.id },
        orderBy: { createdAt: 'desc' },
      });
      
      res.json(addresses);
    } catch (error) {
      console.error('Erro ao listar endereços:', error);
      res.status(500).json({ error: 'Erro ao listar endereços' });
    }
  }
  
  // Buscar endereço por ID
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const address = await prisma.address.findFirst({
        where: { 
          id,
          userId: req.user!.id 
        },
      });
      
      if (!address) {
        return res.status(404).json({ error: 'Endereço não encontrado' });
      }
      
      res.json(address);
    } catch (error) {
      console.error('Erro ao buscar endereço:', error);
      res.status(500).json({ error: 'Erro ao buscar endereço' });
    }
  }
  
  // Criar endereço
  static async create(req: Request, res: Response) {
    const { 
      name, 
      cep, 
      street, 
      number, 
      complement, 
      neighborhood, 
      city, 
      state,
      isDefault 
    } = req.body;
    
    try {
      // Se for definido como padrão, remover padrão dos outros endereços
      if (isDefault) {
        await prisma.address.updateMany({
          where: { userId: req.user!.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      
      const address = await prisma.address.create({
        data: {
          userId: req.user!.id,
          name,
          cep,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          isDefault: isDefault || false,
        },
      });
      
      res.status(201).json(address);
    } catch (error) {
      console.error('Erro ao criar endereço:', error);
      res.status(500).json({ error: 'Erro ao criar endereço' });
    }
  }
  
  // Atualizar endereço
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { 
      name, 
      cep, 
      street, 
      number, 
      complement, 
      neighborhood, 
      city, 
      state,
      isDefault 
    } = req.body;
    
    try {
      // Verificar se endereço pertence ao usuário
      const existing = await prisma.address.findFirst({
        where: { id, userId: req.user!.id },
      });
      
      if (!existing) {
        return res.status(404).json({ error: 'Endereço não encontrado' });
      }
      
      // Se for definido como padrão, remover padrão dos outros
      if (isDefault && !existing.isDefault) {
        await prisma.address.updateMany({
          where: { userId: req.user!.id, isDefault: true },
          data: { isDefault: false },
        });
      }
      
      const address = await prisma.address.update({
        where: { id },
        data: {
          name,
          cep,
          street,
          number,
          complement,
          neighborhood,
          city,
          state,
          isDefault,
        },
      });
      
      res.json(address);
    } catch (error) {
      console.error('Erro ao atualizar endereço:', error);
      res.status(500).json({ error: 'Erro ao atualizar endereço' });
    }
  }
  
  // Deletar endereço
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const existing = await prisma.address.findFirst({
        where: { id, userId: req.user!.id },
      });
      
      if (!existing) {
        return res.status(404).json({ error: 'Endereço não encontrado' });
      }
      
      // Verificar se há pedidos vinculados
      const ordersCount = await prisma.order.count({
        where: { addressId: id },
      });
      
      if (ordersCount > 0) {
        return res.status(400).json({ 
          error: 'Não é possível excluir endereço com pedidos vinculados' 
        });
      }
      
      await prisma.address.delete({ where: { id } });
      res.json({ message: 'Endereço excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir endereço:', error);
      res.status(500).json({ error: 'Erro ao excluir endereço' });
    }
  }
}