// @ts-nocheck
import { Request, Response } from 'express';
import { prisma } from '../config/database';
import { 
  createAsaasCustomer,
  createPixPayment,
  createBoletoPayment,
  getPaymentStatus as getAsaasPaymentStatus
} from '../services/asaas.service';
import { 
  createCardPayment,
  confirmPayment as confirmStripePayment,
  createCheckoutSession
} from '../services/stripe.service';
import { env } from '../config/env';

export class PaymentController {
  // Inicializar pagamento
  static async initiate(req: Request, res: Response) {
    const { orderId, method } = req.body;
    
    try {
      // Buscar pedido
      const order = await prisma.order.findFirst({
        where: {
          id: orderId,
          userId: req.user!.id,
          status: 'PENDING',
        },
        include: {
          user: true,
          items: true,
          address: true,
        },
      });
      
      if (!order) {
        return res.status(404).json({ error: 'Pedido não encontrado ou não pode ser pago' });
      }
      
      // Verificar se já existe pagamento
      const existingPayment = await prisma.payment.findUnique({
        where: { orderId },
      });
      
      if (existingPayment) {
        return res.status(400).json({ error: 'Este pedido já possui um pagamento iniciado' });
      }
      
      let paymentData: any = {
        orderId,
        method,
        amount: order.total,
        status: 'PENDING',
      };
      
      // Criar pagamento de acordo com método
      switch (method) {
        case 'PIX':
          const pixResult = await this.createPix(order);
          paymentData = { ...paymentData, ...pixResult };
          break;
          
        case 'BOLETO':
          const boletoResult = await this.createBoleto(order);
          paymentData = { ...paymentData, ...boletoResult };
          break;
          
        case 'CREDIT_CARD':
        case 'DEBIT_CARD':
          const cardResult = await this.createCard(order);
          paymentData = { ...paymentData, ...cardResult };
          break;
          
        default:
          return res.status(400).json({ error: 'Método de pagamento inválido' });
      }
      
      // Salvar pagamento no banco
      const payment = await prisma.payment.create({
        data: paymentData,
      });
      
      // Atualizar pedido com método de pagamento
      await prisma.order.update({
        where: { id: orderId },
        data: {
          paymentMethod: method,
        },
      });
      
      res.json({
        payment,
        order: {
          id: order.id,
          orderNumber: order.orderNumber,
          total: order.total,
        },
      });
    } catch (error: any) {
      console.error('Erro ao iniciar pagamento:', error);
      res.status(500).json({ 
        error: 'Erro ao processar pagamento',
        message: error.message 
      });
    }
  }
  
  // Criar PIX
  private static async createPix(order: any) {
    try {
      // Criar ou buscar cliente no Asaas
      let customerId = order.user.asaasCustomerId;
      if (!customerId) {
        const customer = await createAsaasCustomer(
          order.user.name,
          order.user.email,
          order.user.phone,
          undefined // CPF/CNPJ opcional
        );
        customerId = customer.id;
        
        // Salvar ID do cliente no banco
        await prisma.user.update({
          where: { id: order.userId },
          data: { asaasCustomerId: customerId },
        });
      }
      
      const pix = await createPixPayment(
        customerId,
        Number(order.total),
        `Pedido ${order.orderNumber} - ${env.STORE_NAME}`,
        new Date(Date.now() + 30 * 60 * 1000) // Expira em 30 min
      );
      
      return {
        gateway: 'asaas',
        gatewayId: pix.id,
        pixQrCode: pix.pixQrCode,
        pixCode: pix.pixCode,
        pixExpiresAt: new Date(Date.now() + 30 * 60 * 1000),
        gatewayData: pix,
      };
    } catch (error) {
      console.error('Erro ao criar PIX:', error);
      throw new Error('Falha ao gerar PIX');
    }
  }
  
  // Criar Boleto
  private static async createBoleto(order: any) {
    try {
      // Criar ou buscar cliente no Asaas
      let customerId = order.user.asaasCustomerId;
      if (!customerId) {
        const customer = await createAsaasCustomer(
          order.user.name,
          order.user.email,
          order.user.phone,
          undefined
        );
        customerId = customer.id;
        
        await prisma.user.update({
          where: { id: order.userId },
          data: { asaasCustomerId: customerId },
        });
      }
      
      const boleto = await createBoletoPayment(
        customerId,
        Number(order.total),
        `Pedido ${order.orderNumber} - ${env.STORE_NAME}`,
        new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // Vence em 3 dias
      );
      
      return {
        gateway: 'asaas',
        gatewayId: boleto.id,
        boletoUrl: boleto.boletoUrl,
        boletoBarcode: boleto.boletoBarcode,
        boletoExpiresAt: new Date(boleto.dueDate),
        gatewayData: boleto,
      };
    } catch (error) {
      console.error('Erro ao criar boleto:', error);
      throw new Error('Falha ao gerar boleto');
    }
  }
  
  // Criar pagamento com cartão
  private static async createCard(order: any) {
    try {
      const payment = await createCardPayment(
        Number(order.total) * 100, // Stripe usa centavos
        'brl',
        `Pedido ${order.orderNumber} - ${env.STORE_NAME}`,
        order.user.email,
        {
          orderId: order.id,
          orderNumber: order.orderNumber,
        }
      );
      
      return {
        gateway: 'stripe',
        gatewayId: payment.id,
        gatewayData: payment,
        clientSecret: payment.clientSecret,
      };
    } catch (error) {
      console.error('Erro ao criar pagamento no cartão:', error);
      throw new Error('Falha ao processar pagamento no cartão');
    }
  }
  
  // Verificar status do pagamento
  static async status(req: Request, res: Response) {
    const { id } = req.params;
    
    try {
      const payment = await prisma.payment.findFirst({
        where: {
          id,
          order: {
            userId: req.user!.id,
          },
        },
        include: {
          order: true,
        },
      });
      
      if (!payment) {
        return res.status(404).json({ error: 'Pagamento não encontrado' });
      }
      
      // Verificar status no gateway
      if (payment.gatewayId && payment.status === 'PENDING') {
        try {
          if (payment.gateway === 'asaas') {
            const asaasStatus = await getAsaasPaymentStatus(payment.gatewayId);
            
            if (asaasStatus.status === 'RECEIVED') {
              // Atualizar pagamento e pedido
              await this.markAsPaid(payment.id);
            }
          } else if (payment.gateway === 'stripe') {
            const stripeStatus = await confirmStripePayment(payment.gatewayId);
            
            if (stripeStatus.status === 'succeeded') {
              await this.markAsPaid(payment.id);
              
              // Salvar dados do cartão
              const charge = stripeStatus.charges[0];
              await prisma.payment.update({
                where: { id: payment.id },
                data: {
                  cardLastDigits: charge?.cardLast4,
                  cardBrand: charge?.cardBrand,
                },
              });
            }
          }
        } catch (err) {
          console.error('Erro ao verificar no gateway:', err);
        }
      }
      
      // Buscar pagamento atualizado
      const updatedPayment = await prisma.payment.findUnique({
        where: { id: payment.id },
        include: {
          order: {
            include: {
              items: {
                select: {
                  productName: true,
                  quantity: true,
                  price: true,
                },
              },
            },
          },
        },
      });
      
      res.json(updatedPayment);
    } catch (error: any) {
      console.error('Erro ao verificar status:', error);
      res.status(500).json({ error: 'Erro ao verificar status do pagamento' });
    }
  }
  
  // Marcar como pago (usado internamente)
  private static async markAsPaid(paymentId: string) {
    const payment = await prisma.payment.update({
      where: { id: paymentId },
      data: {
        status: 'PAID',
        paidAt: new Date(),
      },
    });
    
    // Atualizar pedido
    await prisma.order.update({
      where: { id: payment.orderId },
      data: {
        status: 'PROCESSING',
        paymentStatus: 'PAID',
        paidAt: new Date(),
      },
    });
  }
  
  // Webhook Asaas
  static async asaasWebhook(req: Request, res: Response) {
    const { event, payment } = req.body;
    
    console.log('Webhook Asaas recebido:', event, payment?.id);
    
    try {
      if (event === 'PAYMENT_RECEIVED' || event === 'PAYMENT_CONFIRMED') {
        // Buscar pagamento no banco
        const dbPayment = await prisma.payment.findFirst({
          where: { gatewayId: payment.id, gateway: 'asaas' },
        });
        
        if (dbPayment) {
          await prisma.payment.update({
            where: { id: dbPayment.id },
            data: {
              status: 'PAID',
              paidAt: new Date(),
            },
          });
          
          await prisma.order.update({
            where: { id: dbPayment.orderId },
            data: {
              status: 'PROCESSING',
              paymentStatus: 'PAID',
              paidAt: new Date(),
            },
          });
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Erro no webhook Asaas:', error);
      res.status(500).json({ error: 'Erro ao processar webhook' });
    }
  }
  
  // Webhook Stripe
  static async stripeWebhook(req: Request, res: Response) {
    const sig = req.headers['stripe-signature'];
    const payload = req.body;
    
    console.log('Webhook Stripe recebido');
    
    if (!sig || !env.STRIPE_WEBHOOK_SECRET) {
      return res.status(400).json({ error: 'Assinatura não fornecida' });
    }
    
    try {
      const event = require('../services/stripe.service').verifyWebhookSignature(
        payload,
        sig as string,
        env.STRIPE_WEBHOOK_SECRET
      );
      
      if (!event) {
        return res.status(400).json({ error: 'Assinatura inválida' });
      }
      
      if (event.type === 'payment_intent.succeeded') {
        const paymentIntent = event.data.object;
        
        // Buscar pagamento pelo gateway ID
        const dbPayment = await prisma.payment.findFirst({
          where: { gatewayId: paymentIntent.id },
        });
        
        if (dbPayment) {
          const charge = paymentIntent.charges?.data?.[0];
          await prisma.payment.update({
            where: { id: dbPayment.id },
            data: {
              status: 'PAID',
              paidAt: new Date(paymentIntent.created * 1000),
              cardLastDigits: charge?.payment_method_details?.card?.last4,
              cardBrand: charge?.payment_method_details?.card?.brand,
            },
          });
          
          await prisma.order.update({
            where: { id: dbPayment.orderId },
            data: {
              status: 'PROCESSING',
              paymentStatus: 'PAID',
              paidAt: new Date(paymentIntent.created * 1000),
            },
          });
        }
      }
      
      res.json({ received: true });
    } catch (error) {
      console.error('Erro no webhook Stripe:', error);
      res.status(500).json({ error: 'Erro ao processar webhook' });
    }
  }
}