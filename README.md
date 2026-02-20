# 🎩 DEI VERBUM

**Livraria e Papelaria Cristã**

Sistema completo de e-commerce para venda de livros novos e usados, artigos de papelaria e presentes.

![DEI VERBUM](https://img.shields.io/badge/DEI-VERBUM-blue?style=for-the-badge)
![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)
![Node.js](https://img.shields.io/badge/Node.js-20-green?style=for-the-badge&logo=node.js)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-blue?style=for-the-badge&logo=postgresql)

---

## 📁 Estrutura do Projeto

```
dei-verbum/
├── backend/              # API RESTful (Node.js + Express)
│   ├── prisma/          # Schema e migrations
│   └── src/             # Código fonte
├── frontend/            # Aplicação web (Next.js 14)
│   └── src/
│       ├── app/         # Páginas (App Router)
│       ├── components/  # Componentes React
│       └── store/       # Zustand stores
├── docker-compose.yml   # Desenvolvimento
├── docker-compose.prod.yml  # Produção
├── nginx.conf           # Configuração Nginx
└── scripts/
    └── deploy.sh        # Script de deploy
```

---

## 🚀 Tecnologias

### Backend
- **Node.js** 20 + Express
- **Prisma ORM** + PostgreSQL
- **Redis** (cache)
- **JWT** (autenticação)

### Frontend
- **Next.js** 14 + App Router
- **React** 18 + TypeScript
- **Tailwind CSS**
- **Zustand** (estado)
- **TanStack Query**

### Pagamentos
- **Asaas** - PIX e Boleto
- **Stripe** - Cartões

---

## ⚡ Quick Start

### Desenvolvimento

```bash
cd dei-verbum

# Iniciar PostgreSQL e Redis
docker-compose up -d

# Backend
cd backend
npm install
cp .env.example .env
# Editar .env com Postgres local
npx prisma migrate dev --name init
npm run db:seed
npm run dev

# Frontend
# Em outro terminal
cd frontend
npm install
npm run dev
```

### Produção (Docker)

```bash
cd dei-verbum

# Configurar .env em backend/.env
# Configurar docker-compose.prod.yml

docker-compose -f docker-compose.prod.yml up -d
```

---

## 📝 Credenciais de Teste

| Usuário | Email | Senha | Role |
|---------|-------|-------|------|
| Admin | admin@deiverbum.com.br | admin123 | ADMIN |
| Gerente | gerente@deiverbum.com.br | admin123 | MANAGER |
| Cliente | cliente@email.com | 123456 | CUSTOMER |

---

## 🛠️ Configuração

### Variáveis de Ambiente (`backend/.env`)

```env
# App
NODE_ENV=production
PORT=3001

# Database
DATABASE_URL="postgresql://user:pass@localhost:5432/dei_verbum"

# JWT
JWT_SECRET="sua-chave-secreta-super-segura"

# Stripe
STRIPE_SECRET_KEY="sk_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Asaas (PIX/Boleto)
ASAAS_API_KEY="$aact_..."
ASAAS_ENV=production

# Loja
STORE_NAME="DEI VERBUM"
STORE_EMAIL="contato@deiverbum.com.br"
```

---

## 📱 Páginas da Aplicação

| Página | URL | Descrição |
|--------|-----|-----------|
| Home | `/` | Produtos em destaque |
| Produtos | `/produtos` | Lista com filtros |
| Produto | `/produtos/:slug` | Detalhe do produto |
| Categorias | `/categorias` | Todas as categorias |
| Categoria | `/categorias/:slug` | Produtos da categoria |
| Carrinho | `/carrinho` | Carrinho de compras |
| Checkout | `/checkout` | Finalizar compra |
| Login | `/login` | Entrar/Cadastrar |
| Conta | `/conta` | Área do cliente |
| Admin | `/admin` | Painel administrativo |

---

## 💳 Métodos de Pagamento

- ✅ PIX (QR Code + Copia e Cola)
- ✅ Boleto Bancário
- ✅ Cartão de Crédito
- ✅ Cartão de Débito

---

## 🗃️ Funcionalidades

### Loja Pública
- Busca avançada (título, autor, ISBN)
- Filtros por preço, condição, categoria
- Carrinho persistente
- Checkout com múltiplos endereços

### Administrativa
- CRUD produtos, categorias
- Gestão de estoque com histórico
- Controle de pedidos
- Relatórios de vendas

### Multi-vendedor (Futuro)
- Schema preparado
- Vendedores independentes
- Split de pagamentos

---

## 📚 Documentação

- [Arquitetura](ARCHITECTURE.md)
- [Backend API](BACKEND.md)
- [Status do Projeto](STATUS.md)
- [Padrões de Commits](https://www.conventionalcommits.org/)

---

## 📄 Licença

MIT License - Feito com 🎩 por DEI VERBUM

---

**"No princípio era o Verbo"** — João 1:1
