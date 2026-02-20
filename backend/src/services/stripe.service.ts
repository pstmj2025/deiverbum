// Serviço de integração com Stripe para cartões
import Stripe from 'stripe';
import { env } from '../config/env';

const stripe = env.STRIPE_SECRET_KEY && env.STRIPE_SECRET_KEY.length > 10 ? new Stripe(env.STRIPE_SECRET_KEY, {
  apiVersion: '2024-11-20.acacia' as Stripe.LatestApiVersion,
}) : null;

// Criar Pagamento com cartão
export async function createCardPayment(
  amount: number, // em centavos
  currency: string = 'brl',
  description: string,
  customerEmail: string,
  metadata?: { [key: string]: string }
) {
  try {
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency,
      description,
      receipt_email: customerEmail,
      automatic_payment_methods: { enabled: true },
      metadata: {
        ...metadata,
        source: 'dei-verbum',
      },
    });
    
    return {
      id: paymentIntent.id,
      clientSecret: paymentIntent.client_secret,
      status: paymentIntent.status,
      amount: paymentIntent.amount,
    };
  } catch (error: any) {
    console.error('Erro ao criar pagamento Stripe:', error.message);
    throw error;
  }
}

// Confirmar pagamento
export async function confirmPayment(paymentIntentId: string) {
  try {
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);
    
    return {
      id: paymentIntent.id,
      status: paymentIntent.status,
      amountReceived: paymentIntent.amount_received,
      paymentMethod: paymentIntent.payment_method_types[0],
      charges: paymentIntent.charges.data.map(charge => ({
        id: charge.id,
        status: charge.status,
        receiptUrl: charge.receipt_url,
        cardLast4: charge.payment_method_details?.card?.last4,
        cardBrand: charge.payment_method_details?.card?.brand,
      })),
    };
  } catch (error: any) {
    console.error('Erro ao confirmar pagamento:', error.message);
    throw error;
  }
}

// Criar sessão de checkout (alternativa)
export async function createCheckoutSession(
  amount: number,
  lineItems: { name: string; price: number; quantity: number }[],
  customerEmail: string,
  successUrl: string,
  cancelUrl: string
) {
  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems.map(item => ({
        price_data: {
          currency: 'brl',
          unit_amount: item.price * 100,
          product_data: {
            name: item.name,
          },
        },
        quantity: item.quantity,
      })),
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      customer_email: customerEmail,
    });
    
    return {
      id: session.id,
      url: session.url,
      status: session.status,
    };
  } catch (error: any) {
    console.error('Erro ao criar sessão de checkout:', error.message);
    throw error;
  }
}

// Processar webhook do Stripe
export function verifyWebhookSignature(
  payload: string, 
  signature: string, 
  webhookSecret: string
): Stripe.Event | null {
  try {
    return stripe.webhooks.constructEvent(
      payload,
      signature,
      webhookSecret
    );
  } catch (error: any) {
    console.error('Erro na assinatura do webhook:', error.message);
    return null;
  }
}

export function processWebhook(event: Stripe.Event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return {
        paymentId: event.data.object.id,
        status: 'PAID',
      };
    case 'payment_intent.payment_failed':
      return {
        paymentId: event.data.object.id,
        status: 'FAILED',
      };
    default:
      return null;
  }
}