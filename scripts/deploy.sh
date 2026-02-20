#!/bin/bash
# DEI VERBUM - Script de Deploy

set -e

echo "🎩 DEI VERBUM - Deploy"
echo "======================"

# Cores
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Diretório do projeto
PROJECT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$PROJECT_DIR"

# Verificar .env
if [ ! -f .env ]; then
    echo -e "${RED}❌ Arquivo .env não encontrado!${NC}"
    echo "Crie o arquivo .env baseado em backend/.env.example"
    exit 1
fi

echo -e "${YELLOW}📦 Carregando variáveis...${NC}"
export $(grep -v '^#' .env | xargs)

echo -e "${YELLOW}🐳 Subindo containers...${NC}"
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml build
docker-compose -f docker-compose.prod.yml up -d

echo -e "${YELLOW}⏳ Aguardando banco de dados...${NC}"
sleep 10

echo -e "${YELLOW}🔄 Executando migrations...${NC}"
docker-compose -f docker-compose.prod.yml exec -T backend npx prisma migrate deploy

echo -e "${GREEN}✅ Deploy concluído!${NC}"
echo ""
echo "🌐 Acesse: http://$(curl -s ifconfig.me):80"
echo ""
echo -e "${YELLOW}Comandos úteis:${NC}"
echo "  ./scripts/deploy.sh        # Deploy"
echo "  docker-compose -f docker-compose.prod.yml logs -f  # Logs"
echo "  docker-compose -f docker-compose.prod.yml down      # Parar"
