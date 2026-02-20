// Serviço de integração com Asaas para PIX e Boleto
import axios from 'axios';
import { env } from '../config/env';

const ASAAS_API_URL = env.ASAAS_ENV === 'production' 
  ? 'https://api.asaas.com/v3'
  : 'https://sandbox.asaas.com/api/v3';

const apiClient = axios.create({
  baseURL: ASAAS_API_URL,
  headers: {
    'access_token': env.ASAAS_API_KEY || '',
    'Content-Type': 'application/json',
  },
});

// Criar cliente no Asaas
export async function createAsaasCustomer(
  name: string, 
  email: string, 
  phone?: string,
  cpfCnpj?: string
) {
  try {
    const response = await apiClient.post('/customers', {
      name,
      email,
      phone,
      cpfCnpj: cpfCnpj?.replace(/\D/g, ''), // Remove não-dígitos
    });
    return response.data;
  } catch (error: any) {
    console.error('Erro ao criar cliente Asaas:', error.response?.data || error.message);
    throw error;
  }
}

// Criar cobrança PIX
export async function createPixPayment(
  customerId: string,
  value: number,
  description: string,
  dueDate?: Date
) {
  try {
    const dueDates = dueDate || new Date();
    
    const response = await apiClient.post('/payments', {
      customer: customerId,
      billingType: 'PIX',
      value,
      description,
      dueDate: dueDates.toISOString().split('T')[0],
    });
    
    return {
      id: response.data.id,
      status: response.data.status,
      value: response.data.value,
      pixQrCode: response.data.pixQrCodeImagem || null,
      pixCode: response.data.pixCopiaECola || null,
      invoiceUrl: response.data.invoiceUrl,
    };
  } catch (error: any) {
    console.error('Erro ao criar pagamento PIX:', error.response?.data || error.message);
    throw error;
  }
}

// Criar cobrança de Boleto
export async function createBoletoPayment(
  customerId: string,
  value: number,
  description: string,
  dueDate: Date
) {
  try {
    const response = await apiClient.post('/payments', {
      customer: customerId,
      billingType: 'BOLETO',
      value,
      description,
      dueDate: dueDate.toISOString().split('T')[0],
    });
    
    return {
      id: response.data.id,
      status: response.data.status,
      value: response.data.value,
      boletoUrl: response.data.invoiceUrl,
      boletoBarcode: response.data.barCode,
      dueDate: response.data.dueDate,
    };
  } catch (error: any) {
    console.error('Erro ao criar boleto:', error.response?.data || error.message);
    throw error;
  }
}

// Verificar status de pagamento
export async function getPaymentStatus(paymentId: string) {
  try {
    const response = await apiClient.get(`/payments/${paymentId}`);
    return {
      id: response.data.id,
      status: response.data.status, // PENDING, RECEIVED, OVERDUE, etc
      value: response.data.value,
      paidDate: response.data.paymentDate,
    };
  } catch (error: any) {
    console.error('Erro ao verificar pagamento:', error.response?.data || error.message);
    throw error;
  }
}

// Processar webhook do Asaas
export function processWebhook(payload: any) {
  const { event, payment } = payload;
  
  if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
    return {
      paymentId: payment.id,
      status: 'PAID',
      paidAt: payment.paymentDate || new Date().toISOString(),
    };
  }
  
  if (event === 'PAYMENT_OVERDUE') {
    return {
      paymentId: payment.id,
      status: 'FAILED',
    };
  }
  
  return null;
}