import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'info', 'warn', 'error'] : ['error'],
});

export async function connectDatabase() {
  try {
    await prisma.$connect();
    console.log('📦 Conectado ao PostgreSQL via Prisma');
  } catch (error) {
    console.error('❌ Erro ao conectar ao banco de dados:', error);
    process.exit(1);
  }
}

export async function disconnectDatabase() {
  await prisma.$disconnect();
  console.log('📦 Desconectado do PostgreSQL');
}

// Tratamento de shutdown gracioso
process.on('SIGINT', async () => {
  console.log('\n🔄 Recebido SIGINT, encerrando conexão...');
  await disconnectDatabase();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  console.log('\n🔄 Recebido SIGTERM, encerrando conexão...');
  await disconnectDatabase();
  process.exit(0);
});
