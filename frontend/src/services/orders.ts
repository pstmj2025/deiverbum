import api from '@/lib/axios';
import { Order, CheckoutData } from '@/types';

export interface OrdersResponse {
  orders: Order[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export const ordersService = {
  // Criar pedido
  create: async (data: CheckoutData): Promise<Order> => {
    const response = await api.post('/orders', data);
    return response.data;
  },

  // Listar meus pedidos
  list: async (page = 1, limit = 10): Promise<OrdersResponse> => {
    const response = await api.get('/orders', { params: { page, limit } });
    return response.data;
  },

  // Buscar pedido por ID
  getById: async (id: string): Promise<Order> => {
    const response = await api.get(`/orders/${id}`);
    return response.data;
  },

  // Cancelar pedido
  cancel: async (id: string, reason?: string): Promise<void> => {
    await api.post(`/orders/${id}/cancel`, { reason });
  },

  // Admin: Listar todos os pedidos
  adminList: async (
    status?: string,
    page = 1,
    limit = 20
  ): Promise<OrdersResponse> => {
    const response = await api.get('/orders/admin/all', {
      params: { status, page, limit },
    });
    return response.data;
  },

  // Admin: Atualizar status
  updateStatus: async (
    id: string,
    data: { status: string; trackingCode?: string }
  ): Promise<Order> => {
    const response = await api.put(`/orders/${id}/status`, data);
    return response.data;
  },
};
