FROM node:18-alpine

WORKDIR /app

# Instalar dependências primeiro para cache
COPY backend/package*.json ./
RUN npm install --include=dev

# Gerar Prisma
COPY backend/prisma ./prisma/
RUN npx prisma generate

# Copiar código
COPY backend/src ./src
COPY backend/tsconfig.json ./

EXPOSE 10000

CMD ["npx", "ts-node", "--transpileOnly", "src/index.ts"]
