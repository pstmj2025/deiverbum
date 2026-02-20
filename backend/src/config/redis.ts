import { createClient, RedisClientType } from 'redis';

let redisClient: RedisClientType | null = null;

export async function connectRedis() {
  const redisUrl = process.env.REDIS_URL;
  if (!redisUrl) {
    console.log('⚠️ REDIS_URL não configurado - cache desabilitado');
    return;
  }
  
  try {
    redisClient = createClient({ url: redisUrl });
    redisClient.on('error', (err) => {
      console.error('❌ Erro no Redis:', err.message);
    });
    await redisClient.connect();
    console.log('🔌 Conectado ao Redis');
  } catch (error) {
    console.error('❌ Erro ao conectar ao Redis:', error);
    redisClient = null;
  }
}

export { redisClient };
