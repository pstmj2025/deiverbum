# DEI VERBUM - Backend Dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar código
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Compilar TypeScript
RUN npm run build

# Produção
FROM node:20-alpine

WORKDIR /app

# Criar diretório para uploads
RUN mkdir -p /app/uploads

# Copiar arquivos necessários
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/prisma ./prisma

# Expor porta
EXPOSE 3001

# Healthcheck
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3001/health || exit 1

# Comando
CMD ["sh", "-c", "npx prisma migrate deploy && npx prisma generate && npm start"]
