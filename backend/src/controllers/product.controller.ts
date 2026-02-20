import { Request, Response } from 'express';
import { prisma } from '../config/database';
import slugify from 'slugify';

export class ProductController {
  // Lista pública de produtos com filtros
  static async list(req: Request, res: Response) {
    try {
      const { 
        category, 
        condition, 
        type,
        minPrice, 
        maxPrice, 
        search,
        featured,
        sort = 'createdAt',
        order = 'desc',
        page = '1',
        limit = '20',
      } = req.query;
      
      const where: any = { active: true };
      
      if (category) {
        where.category = { slug: category as string };
      }
      
      if (condition) {
        where.condition = condition as string;
      }
      
      if (type) {
        where.type = type as string;
      }
      
      if (featured === 'true') {
        where.featured = true;
      }
      
      if (minPrice || maxPrice) {
        where.price = {};
        if (minPrice) where.price.gte = Number(minPrice);
        if (maxPrice) where.price.lte = Number(maxPrice);
      }
      
      if (search) {
        where.OR = [
          { name: { contains: search as string, mode: 'insensitive' } },
          { description: { contains: search as string, mode: 'insensitive' } },
          { author: { contains: search as string, mode: 'insensitive' } },
          { isbn10: { contains: search as string } },
          { isbn13: { contains: search as string } },
        ];
      }
      
      const skip = (Number(page) - 1) * Number(limit);
      
      const [products, total] = await Promise.all([
        prisma.product.findMany({
          where,
          include: {
            category: {
              select: { name: true, slug: true },
            },
          },
          skip,
          take: Number(limit),
          orderBy: { [sort as string]: order },
        }),
        prisma.product.count({ where }),
      ]);
      
      res.json({
        products,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          pages: Math.ceil(total / Number(limit)),
        },
      });
    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({ error: 'Erro ao listar produtos' });
    }
  }
  
  // Buscar produto por slug
  static async getBySlug(req: Request, res: Response) {
    const { slug } = req.params;
    
    try {
      const product = await prisma.product.findUnique({
        where: { slug, active: true },
        include: {
          category: {
            select: { id: true, name: true, slug: true },
          },
          stockMovements: {
            orderBy: { createdAt: 'desc' },
            take: 5,
            select: {
              quantity: true,
              type: true,
              createdAt: true,
            },
          },
        },
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      res.json(product);
    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({ error: 'Erro ao buscar produto' });
    }
  }
  
  // Produtos em destaque
  static async featured(req: Request, res: Response) {
    try {
      const products = await prisma.product.findMany({
        where: { active: true, featured: true },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
        take: 10,
      });
      
      res.json(products);
    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      res.status(500).json({ error: 'Erro ao buscar produtos em destaque' });
    }
  }
  
  // Criar produto (admin)
  static async create(req: Request, res: Response) {
    const {
      sku,
      name,
      description,
      type,
      price,
      cost,
      comparePrice,
      stock,
      categoryId,
      condition,
      weight,
      dimensions,
      isbn10,
      isbn13,
      author,
      publisher,
      year,
      pages,
      language,
      images,
      featured,
    } = req.body;
    
    try {
      const slug = slugify(name, { lower: true, strict: true });
      
      // Verificar se já existe um produto com mesmo slug ou SKU
      const existing = await prisma.product.findFirst({
        where: {
          OR: [{ sku }, { slug }],
        },
      });
      
      if (existing) {
        return res.status(409).json({ 
          error: 'Produto com mesmo SKU ou nome já existe' 
        });
      }
      
      const product = await prisma.product.create({
        data: {
          sku,
          name,
          slug,
          description,
          type,
          price,
          cost,
          comparePrice,
          stock,
          categoryId,
          condition,
          weight,
          dimensions,
          isbn10,
          isbn13,
          author,
          publisher,
          year,
          pages,
          language,
          images: images || [],
          featured: featured || false,
        },
        include: {
          category: {
            select: { name: true, slug: true },
          },
        },
      });
      
      // Registrar movimentação de entrada
      if (stock > 0) {
        await prisma.stockMovement.create({
          data: {
            productId: product.id,
            quantity: stock,
            type: 'IN',
            note: 'Cadastro inicial do produto',
          },
        });
      }
      
      res.status(201).json(product);
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      res.status(500).json({ error: 'Erro ao criar produto' });
    }
  }
  
  // Atualizar produto (admin)
  static async update(req: Request, res: Response) {
    const { id } = req.params;
    const {
      name,
      description,
      price,
      cost,
      comparePrice,
      stock,
      categoryId,
      condition,
      weight,
      dimensions,
      isbn10,
      isbn13,
      author,
      publisher,
      year,
      pages,
      language,
      images,
      featured,
      active,
    } = req.body;
    
    try {
      const data: any = {};
      
      if (name !== undefined) {
        data.name = name;
        data.slug = slugify(name, { lower: true, strict: true });
      }
      if (description !== undefined) data.description = description;
      if (price !== undefined) data.price = price;
      if (cost !== undefined) data.cost = cost;
      if (comparePrice !== undefined) data.comparePrice = comparePrice;
      if (categoryId !== undefined) data.categoryId = categoryId;
      if (condition !== undefined) data.condition = condition;
      if (weight !== undefined) data.weight = weight;
      if (dimensions !== undefined) data.dimensions = dimensions;
      if (isbn10 !== undefined) data.isbn10 = isbn10;
      if (isbn13 !== undefined) data.isbn13 = isbn13;
      if (author !== undefined) data.author = author;
      if (publisher !== undefined) data.publisher = publisher;
      if (year !== undefined) data.year = year;
      if (pages !== undefined) data.pages = pages;
      if (language !== undefined) data.language = language;
      if (images !== undefined) data.images = images;
      if (featured !== undefined) data.featured = featured;
      if (active !== undefined) data.active = active;
      
      // Se mudou o estoque, registrar movimentação
      if (stock !== undefined) {
        const oldProduct = await prisma.product.findUnique({
          where: { id },
          select: { stock: true },
        });
        
        if (oldProduct && oldProduct.stock !== stock) {
          const diff = stock - oldProduct.stock;
          await prisma.stockMovement.create({
            data: {
              productId: id,
              quantity: diff,
              type: diff > 0 ? 'ADJUSTMENT' : 'ADJUSTMENT',
              note: `Ajuste manual de estoque: ${oldProduct.stock} → ${stock}`,
            },
          });
        }
        
        data.stock = stock;
      }
      
      const product = await prisma.product.update({
        where: { id },
        data,
        include: {
          category: { select: { name: true, slug: true } },
        },
      });
      
      res.json(product);
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      res.status(500).json({ error: 'Erro ao atualizar produto' });
    }
  }
  
  // Deletar produto (admin)
  static async delete(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      // Verificar se há pedidos vinculados
      const orderItems = await prisma.orderItem.findFirst({
        where: { productId: id },
      });
      
      if (orderItems) {
        return res.status(400).json({ 
          error: 'Não é possível excluir produto com pedidos vinculados. Desative-o ao invés disso.' 
        });
      }
      
      await prisma.product.delete({ where: { id } });
      res.json({ message: 'Produto excluído com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      res.status(500).json({ error: 'Erro ao excluir produto' });
    }
  }
  
  // Atualizar estoque (admin)
  static async updateStock(req: Request, res: Response) {
    const { id } = req.params;
    const { quantity, type, note } = req.body;
    
    try {
      // Buscar produto
      const product = await prisma.product.findUnique({
        where: { id },
        select: { id: true, stock: true, name: true },
      });
      
      if (!product) {
        return res.status(404).json({ error: 'Produto não encontrado' });
      }
      
      // Calcular novo estoque
      let newStock = product.stock;
      if (type === 'IN') {
        newStock += quantity;
      } else if (type === 'OUT') {
        newStock -= quantity;
        if (newStock < 0) {
          return res.status(400).json({ 
            error: 'Estoque não pode ficar negativo' 
          });
        }
      } else {
        newStock = quantity;
      }
      
      // Transaction: atualizar estoque + movimentação
      const [updatedProduct, movement] = await prisma.$transaction([
        prisma.product.update({
          where: { id },
          data: { stock: newStock },
        }),
        prisma.stockMovement.create({
          data: {
            productId: id,
            quantity: type === 'OUT' ? -quantity : quantity,
            type,
            note,
          },
        }),
      ]);
      
      res.json({
        product: updatedProduct,
        movement,
        previousStock: product.stock,
        newStock,
      });
    } catch (error) {
      console.error('Erro ao atualizar estoque:', error);
      res.status(500).json({ error: 'Erro ao atualizar estoque' });
    }
  }
}