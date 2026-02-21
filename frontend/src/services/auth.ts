import api from '@/lib/axios';

export const authService = {
  login: async (email: string, password: string) => {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  },
  register: async (data: { name: string; email: string; password: string; phone?: string }) => {
    const response = await api.post('/auth/register', data);
    return response.data;
  },
  me: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },
  updateProfile: async (data: Partial<{ name: string; email: string; phone: string }>) => {
    const response = await api.put('/auth/me', data);
    return response.data;
  },
};
