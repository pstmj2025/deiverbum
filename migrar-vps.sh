#!/bin/bash
# Script de migração para VPS Hostinger
# DEI VERBUM - Migração completa

echo "🚀 Iniciando migração para VPS..."

# 1. Clonar/atualizar repositório
cd ~
if [ -d "deiverbum" ]; then
    echo "📂 Atualizando repositório..."
    cd deiverbum && git pull origin master
else
    echo "📥 Clonando repositório..."
    git clone https://github.com/pstmj2025/deiverbum.git
    cd deiverbum
fi

# 2. Criar docker-compose para produção
echo "📝 Criando docker-compose.production.yml..."
cat > docker-compose.production.yml << 'EOF'
version: '3.8'

services:
  # PostgreSQL Database
  db:
    image: postgres:15-alpine
    container_name: dei-verbum-db
    restart: always
    environment:
      POSTGRES_USER: dei_verbum
      POSTGRES_PASSWORD: DeiVerbum2024!
      POSTGRES_DB: dei_verbum
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U dei_verbum"]
      interval: 10s
      timeout: 5s
      retries: 5

  # Backend API
  backend:
    build:
      context: ./backend
      dockerfile: Dockerfile
    container_name: dei-verbum-api
    restart: always
    environment:
      NODE_ENV: production
      PORT: 3000
      DATABASE_URL: postgresql://dei_verbum:DeiVerbum2024!@db:5432/dei_verbum
      JWT_SECRET: super-secret-jwt-key-change-in-production
      JWT_EXPIRES_IN: 7d
      API_URL: http://localhost:3000
      CORS_ORIGIN: "*"
    ports:
      - "3000:3000"
    depends_on:
      db:
        condition: service_healthy
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/health"]
      interval: 30s
      timeout: 10s
      retries: 3

  # Frontend (opcional - pode manter na Vercel)
  # Descomente se quiser rodar frontend na VPS também
  # frontend:
  #   build:
  #     context: ./frontend
  #     dockerfile: Dockerfile
  #   container_name: dei-verbum-frontend
  #   restart: always
  #   ports:
  #     - "80:3000"
  #   depends_on:
  #     - backend

volumes:
  postgres_data:
EOF

# 3. Criar Dockerfile para backend
echo "📝 Criando Dockerfile do backend..."
cat > backend/Dockerfile << 'EOF'
FROM node:18-alpine

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm ci --only=production

# Gerar Prisma Client
COPY prisma ./prisma/
RUN npx prisma generate

# Copiar código
COPY . .

# Expor porta
EXPOSE 3000

# Comando de inicialização
CMD ["sh", "-c", "npx prisma migrate deploy && npx ts-node --transpileOnly src/index.ts"]
EOF

# 4. Subir containers
echo "🐳 Subindo containers..."
docker compose -f docker-compose.production.yml down
docker compose -f docker-compose.production.yml up -d --build

# 5. Aguardar banco iniciar
echo "⏳ Aguardando banco..."
sleep 15

# 6. Rodar migrations
echo "🔧 Rodando migrations..."
docker compose -f docker-compose.production.yml exec backend npx prisma migrate deploy || echo "Migrations já aplicadas"

# 7. Criar usuário admin (se não existir)
echo "👤 Criando usuário admin..."
docker compose -f docker-compose.production.yml exec -T backend npx prisma db seed 2>/dev/null || echo "Seed opcional"

echo ""
echo "✅ MIGRAÇÃO CONCLUÍDA!"
echo ""
echo "📊 STATUS:"
docker compose -f docker-compose.production.yml ps

echo ""
echo "🔗 LINKS:"
echo "  Backend: http://$(hostname -I | awk '{print $1}'):3000"
echo "  Health: http://$(hostname -I | awk '{print $1}'):3000/health"
echo ""
echo "📋 PRÓXIMOS PASSOS:"
echo "  1. Configure o firewall: ufw allow 3000"
echo "  2. Configure Nginx (opcional) para proxy reverso"
echo "  3. Atualize frontend para apontar para nova API"
echo ""
