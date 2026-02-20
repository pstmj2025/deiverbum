import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import path from 'path';

import { connectDatabase, disconnectDatabase } from './config/database';
import { connectRedis } from './config/redis';
import { env } from './config/env';
import { errorHandler } from './middleware/errorHandler';

// Importar rotas
import { authRouter } from './routes/auth.routes';
import { categoryRouter } from './routes/category.routes';
import { productRouter } from './routes/product.routes';
import { orderRouter } from './routes/order.routes';
import { addressRouter } from './routes/address.routes';
import { paymentRouter } from './routes/payment.routes';

const app = express();

// Trust proxy (necessário para rate limit)
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: env.FRONTEND_URL,
  credentials: true,
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

app.use(morgan('dev'));

// Servir arquivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    version: '1.0.0',
    store: env.STORE_NAME,
  });
});

// Rotas da API
app.use('/api/auth', authRouter);
app.use('/api/categories', categoryRouter);
app.use('/api/products', productRouter);
app.use('/api/orders', orderRouter);
app.use('/api/addresses', addressRouter);
app.use('/api/payments', paymentRouter);
// /api/products
// /api/orders
// /api/cart
// /api/addresses
// /api/payments
// /api/admin/*

// Middleware de erro (deve ser o último)
app.use(errorHandler);

// Iniciar servidor
async function startServer() {
  try {
    // Conectar ao banco de dados
    await connectDatabase();
    
    // Conectar ao Redis (opcional)
    await connectRedis().catch(err => {
      console.warn('⚠️ Redis não conectado, continuando sem cache');
    });
    
    const PORT = env.PORT;
    
    app.listen(PORT, () => {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log(`🎩 ${env.STORE_NAME} API rodando!`);
      console.log(`📡 URL: http://localhost:${PORT}`);
      console.log(`🔧 Ambiente: ${env.NODE_ENV}`);
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    });
  } catch (error) {
    console.error('❌ Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Graceful shutdown
process.on('SIGTERM', async () => {
  console.log('🛑 SIGTERM recebido, encerrando graciosamente...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGINT', async () => {
  console.log('🛑 SIGINT recebido, encerrando graciosamente...');
  await disconnectDatabase();
  process.exit(0);
});

startServer();
