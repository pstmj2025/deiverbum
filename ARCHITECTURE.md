# DEI VERBUM - Arquitetura

## Visão Geral
Sistema de e-commerce para venda de livros novos/usados e papelaria, com arquitetura modular que permite expansão futura para modelo multi-vendedor (sub-livrarias).

## Stack Tecnológico

### Backend
- **Node.js** + **Express.js** (API REST)
- **PostgreSQL** (banco principal)
- **Redis** (cache e sessões)
- **Prisma ORM** (gerenciamento de BD)
- **JWT** (autenticação)
- **Multer** (upload de imagens)
- **Stripe** (cartões) + **Asaas** (PIX/Boleto)

### Frontend
- **Next.js 14** (App Router)
- **Tailwind CSS** (estilização)
- **TanStack Query** (React Query)
- **Zustand** (estado global)
- **Shadcn/UI** (componentes)

### Infraestrutura
- **Hostinger VPS** (backend + BD)
- **Vercel** (frontend - opcional futuro)
- **Cloudflare R2** (armazenamento de imagens)

## Estrutura de Pastas

```
dei-verbum/
├── backend/
│   ├── prisma/              # Schema e migrations
│   ├── src/
│   │   ├── config/          # Configurações
│   │   ├── controllers/     # Lógica de negócio
│   │   ├── middleware/      # Auth, validações
│   │   ├── models/          # Tipos/Types
│   │   ├── routes/          # Definição de rotas
│   │   ├── services/        # Pagamentos, notificações
│   │   ├── utils/           # Helpers
│   │   └── index.ts         # Entry point
│   ├── uploads/             # Imagens de produtos
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/             # App Router Next.js
│   │   │   ├── (shop)/      # Área pública
│   │   │   └── admin/       # Painel administrativo
│   │   ├── components/      # Componentes reutilizáveis
│   │   ├── lib/             # Utils, API client
│   │   └── types/           # Types TypeScript
│   ├── public/              # Assets estáticos
│   └── package.json
├── shared/                  # Tipos/constantes compartilhadas
└── docker-compose.yml       # Configuração Docker
```

## Modelos Principais (Prisma Schema)

```prisma
// Usuários (clientes + admins)
model User { id, email, name, phone, address, role, passwordHash }

// Produtos (livros, papelaria)
model Product { id, sku, name, description, price, cost, category, 
               condition, stock, images, active, publisher, author, isbn }

// Categorias
model Category { id, name, slug, parentId }

// Pedidos
model Order { id, userId, items, total, status, payment, shipping }

// Pagamentos
model Payment { id, orderId, method, amount, status, externalId }

// Estoque (histórico)
model StockMovement { id, productId, quantity, type, note, createdAt }

// Fornecedores (futuro multi-vendedor)
model Vendor { id, name, email, phone, commission, active }
```

## Módulos Principais

1. **Catálogo** - Busca, filtros, filtros por estado (novo/usado)
2. **Carrinho** - Persistente, sincrônico
3. **Checkout** - Endereços, cálculo de frete
4. **Pagamento** - PIX, Boleto, Cartão
5. **Área Cliente** - Pedidos, dados, favoritos
6. **Painel Admin** - Produtos, estoque, pedidos, relatórios

## Estados de Pagamento
- PENDING → await payment
- PROCESSING → gateway processando
- PAID → confirmado
- SHIPPED → enviado
- DELIVERED → entregue
- CANCELLED → cancelado

## Estados de Produto
- ACTIVE - visível
- INACTIVE - oculto
- OUT_OF_STOCK - sem estoque

## Estados Livro (condition)
- NEW - Novo
- LIKE_NEW - Semi-novo
- GOOD - Bom estado
- ACCEPTABLE - Estado regular
