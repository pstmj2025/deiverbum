import { Request, Response } from 'express';
import { prisma } from '../config/database';
import slugify from 'slugify';

export class CategoryController {
  // Listar categorias (público)
  static async list(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        where: { active: true, parentId: null },
        include: {
          children: {
            where: { active: true },
            select: { id: true, name: true, slug: true, image: true },
          },
          _count: { select: { products: true } },
        },
        orderBy: { sortOrder: 'asc' },
      });
      res.json(categories);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao listar categorias' });
    }
  }

  // Listar todas categorias (admin) - inclui inativas
  static async listAll(req: Request, res: Response) {
    try {
      const categories = await prisma.category.findMany({
        include: {
          parent: { select: { id: true, name: true } },
          children: { select: { id: true, name: true } },
          _count: { select: { products: true } },
        },
        orderBy: [{ parentId: 'asc' }, { sortOrder: 'asc' }],
      });
      res.json(categories);
    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({ error: 'Erro ao listar categorias' });
    }
  }

  // Ver categoria por slug
  static async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    try {
      const category = await prisma.category.findUnique({
        where: { slug },
        include: {
          parent: { select: { id: true, name: true, slug: true } },
          children: {
            where: { active: true },
            select: { id: true, name: true, slug: true, image: true },
          },
          _count: { select: { products: true } },
        },
      });
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      res.json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  // Ver categoria por ID (admin)
  static async getById(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: {
          parent: { select: { id: true, name: true } },
          children: { select: { id: true, name: true } },
          products: { select: { id: true, name: true, slug: true, active: true } },
        },
      });
      if (!category) {
        return res.status(404).json({ error: 'Categoria não encontrada' });
      }
      res.json(category);
    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({ error: 'Erro ao buscar categoria' });
    }
  }

  // Criar categoria (admin)
  static async create(req: Request, res: Response) {
    const { name, description, parentId, image, sortOrder } = req.body;
    try {
      let slug = slugify(name, { lower: true, strict: true });
      // Verificar se slug já existe
      const existing = await prisma.category.findUnique({ where: { slug } });
      if (existing) {
        slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
      }
      // Verificar parent se fornecido
      if (parentId) {
        const parent = await prisma.category.findUnique({ where: { id: parentId } });
        if (!parent) return res.status(400).json({ error: 'Categoria pai não encontrada' });
      }
      const category = await prisma.category.create({
        data: { name, slug, description, parentId: parentId || null, image, sortOrder: sortOrder || 0 },
      });
      res.status(201).json(category);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  // Atualizar categoria (admin)
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const { name, description, parentId, image, sortOrder, active } = req.body;
    try {
      const category = await prisma.category.findUnique({ where: { id } });
      if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
      const data: any = { description, image, sortOrder, active };
      // Se mudou o nome, atualizar slug
      if (name && name !== category.name) {
        let slug = slugify(name, { lower: true, strict: true });
        const existing = await prisma.category.findFirst({ where: { slug, id: { not: id } } });
        if (existing) slug = `${slug}-${Date.now().toString(36).slice(-4)}`;
        data.name = name;
        data.slug = slug;
      }
      // Verificar parent
      if (parentId !== undefined) {
        if (parentId === id) return res.status(400).json({ error: 'Categoria não pode ser pai de si mesma' });
        if (parentId) {
          const parent = await prisma.category.findUnique({ where: { id: parentId } });
          if (!parent) return res.status(400).json({ error: 'Categoria pai não encontrada' });
        }
        data.parentId = parentId || null;
      }
      const updated = await prisma.category.update({ where: { id }, data });
      res.json(updated);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  // Excluir categoria (admin)
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    try {
      const category = await prisma.category.findUnique({
        where: { id },
        include: { _count: { select: { children: true, products: true } } },
      });
      if (!category) return res.status(404).json({ error: 'Categoria não encontrada' });
      if (category._count.children > 0) return res.status(400).json({ error: 'Não pode excluir categoria com subcategorias' });
      if (category._count.products > 0) return res.status(400).json({ error: 'Não pode excluir categoria com produtos' });
      await prisma.category.delete({ where: { id } });
      res.json({ message: 'Categoria excluída com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  }

  // Reordenar categorias (admin)
  static async reorder(req: Request, res: Response) {
    const { items } = req.body;
    if (!Array.isArray(items)) return res.status(400).json({ error: 'Items deve ser um array' });
    try {
      await prisma.$transaction(
        items.map((item: { id: string; sortOrder: number }) =>
          prisma.category.update({ where: { id: item.id }, data: { sortOrder: item.sortOrder } })
        )
      );
      res.json({ message: 'Categorias reordenadas' });
    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      res.status(500).json({ error: 'Erro ao reordenar categorias' });
    }
  }
}
