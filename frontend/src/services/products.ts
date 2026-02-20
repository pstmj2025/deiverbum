import api from '@/lib/axios';
import { Product } from '@/types';

export interface ProductsResponse {
  products: Product[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const productsService = {
  // Listar produtos com filtros
  list: async (params: {
    page?: number;
    limit?: number;
    category?: string;
    search?: string;
    featured?: boolean;
    condition?: string;
    minPrice?: number;
    maxPrice?: number;
    sort?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<ProductsResponse> => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Produtos em destaque
  featured: async (): Promise<Product[]> => {
    const response = await api.get('/products/featured');
    return response.data;
  },

  // Buscar produto por slug
  getBySlug: async (slug: string): Promise<Product> => {
    const response = await api.get(`/products/${slug}`);
    return response.data;
  },

  // Criar produto (admin)
  create: async (data: FormData): Promise<Product> => {
    const response = await api.post('/products', data, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  },

  // Atualizar produto
  update: async (id: string, data: Partial<Product>): Promise<Product> => {
    const response = await api.put(`/products/${id}`, data);
    return response.data;
  },

  // Deletar produto
  delete: async (id: string): Promise<void> => {
    await api.delete(`/products/${id}`);
  },
};
