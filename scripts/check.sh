#!/bin/bash
# Verificar status do projeto DEI VERBUM

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🎩 DEI VERBUM - Verificação do Projeto"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Verificar estrutura do backend
echo "📦 Backend:"
echo "  ✅ Schema Prisma: $(test -f dei-verbum/backend/prisma/schema.prisma && echo 'EXSITE' || echo 'FALTANDO')"
echo "  ✅ Controllers: $(ls dei-verbum/backend/src/controllers/*.ts 2>/dev/null | wc -l) arquivos"
echo "  ✅ Rotas: $(ls dei-verbum/backend/src/routes/*.ts 2>/dev/null | wc -l) arquivos"
echo "  ✅ Services: $(ls dei-verbum/backend/src/services/*.ts 2>/dev/null | wc -l) arquivos"
echo ""

# Verificar frontend
echo "💻 Frontend:"
if [ -d "dei-verbum/frontend/src" ]; then
  echo "  ✅ Estrutura Next.js criada"
  echo "  📄 Páginas: $(ls dei-verbum/frontend/src/app/*.tsx 2>/dev/null | wc -l)"
  echo "  🧩 Componentes: $(ls dei-verbum/frontend/src/components/*.tsx 2>/dev/null | wc -l)"
else
  echo "  ⏳ Em construção pelo sub-agent"
fi
echo ""

# Verificar configurações de deploy
echo "🚀 Deploy:"
echo "  -.env.example: $(test -f dei-verbum/backend/.env.example && echo '✅' || echo '❌')"
echo "  docker-compose.yml: $(test -f dei-verbum/docker-compose.yml && echo '✅' || echo '❌')"
echo "  docker-compose.prod.yml: $(test -f dei-verbum/docker-compose.prod.yml && echo '✅' || echo '⏳')"
echo "  nginx.conf: $(test -f dei-verbum/nginx.conf && echo '✅' || echo '⏳')"
echo ""

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "Para iniciar: cd dei-verbum/backend && npm install && npm run db:migrate && npm run db:seed"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
