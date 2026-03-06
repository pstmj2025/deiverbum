# DEI VERBUM - Frontend Dockerfile
FROM node:20-alpine AS builder
WORKDIR /app

# Argumentos de build
ARG API_URL
ENV NEXT_PUBLIC_API_URL=${API_URL}

# Instalar dependências (do contexto root, pegando da pasta frontend)
COPY frontend/package*.json ./
RUN npm install

# Copiar código
COPY frontend/ .

# Build
RUN npm run build

# Produção
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
ENV PORT 3000

# Copiar build
COPY --from=builder /app/next.config.js ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000
ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

CMD ["node", "server.js"]
