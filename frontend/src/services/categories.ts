import api from '@/lib/axios';
import { Category } from '@/types';

export const categoriesService = {
  // Listar todas as categorias
  list: async (): Promise<Category[]> => {
    const response = await api.get('/categories');
    return response.data;
  },

  // Buscar categoria por slug
  getBySlug: async (slug: string): Promise<Category> => {
    const response = await api.get(`/categories/${slug}`);
    return response.data;
  },

  // Criar categoria (admin)
  create: async (data: Omit<Category, 'id'>): Promise<Category> => {
    const response = await api.post('/categories', data);
    return response.data;
  },

  // Atualizar categoria
  update: async (id: string, data: Partial<Category>): Promise<Category> => {
    const response = await api.put(`/categories/${id}`, data);
    return response.data;
  },

  // Deletar categoria
  delete: async (id: string): Promise<void> => {
    await api.delete(`/categories/${id}`);
  },
};
