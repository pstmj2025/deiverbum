# DEI VERBUM - Backend API

API RESTful para e-commerce de livros e papelaria.

## Estrutura

```
backend/
├── prisma/               # Schema e migrations
├── src/
│   ├── config/          # Configurações (DB, Redis, env)
│   ├── controllers/     # Lógica de negócio
│   ├── middleware/      # Auth, rate limit, etc
│   ├── routes/          # Rotas da API
│   ├── services/        # Integrações (Asaas, Stripe)
│   ├── utils/           # Helpers
│   └── index.ts         # Entry point
├── uploads/             # Imagens (local)
└── package.json
```

## Instalação

```bash
# Copiar configuração
cp .env.example .env
# Editar .env com suas credenciais

# Instalar dependências
npm install

# Gerar Prisma Client
npx prisma generate

# Executar migrations
npx prisma migrate dev --name init

# Iniciar em desenvolvimento
npm run dev

# Ou com Docker
docker-compose up -d
```

## Endpoints Principais

### Autenticação
- `POST /api/auth/register` - Criar conta
- `POST /api/auth/login` - Login
- `GET /api/auth/profile` - Perfil
- `PUT /api/auth/profile` - Atualizar perfil
- `PUT /api/auth/password` - Alterar senha

### Categorias
- `GET /api/categories` - Listar categorias
- `GET /api/categories/:slug` - Ver categoria
- `POST /api/categories` - Criar (admin)
- `PUT /api/categories/:id` - Atualizar (admin)

### Produtos
- `GET /api/products` - Listar com filtros
- `GET /api/products/featured` - Destaques
- `GET /api/products/:slug` - Ver produto
- `POST /api/products` - Criar (admin)
- `PUT /api/products/:id` - Atualizar (admin)
- `DELETE /api/products/:id` - Excluir (admin)

### Endereços
- `GET /api/addresses` - Listar
- `POST /api/addresses` - Criar
- `PUT /api/addresses/:id` - Atualizar
- `DELETE /api/addresses/:id` - Excluir

### Pedidos
- `GET /api/orders` - Meus pedidos
- `GET /api/orders/:id` - Ver pedido
- `POST /api/orders` - Criar pedido
- `POST /api/orders/:id/cancel` - Cancelar
- `GET /api/orders/admin/all` - Todos pedidos (admin)
- `PUT /api/orders/:id/status` - Atualizar status (admin)

### Pagamentos
- `POST /api/payments/initiate` - Iniciar pagamento
- `GET /api/payments/:id/status` - Verificar status
- `POST /api/payments/webhook/asaas` - Webhook Asaas
- `POST /api/payments/webhook/stripe` - Webhook Stripe

## Filtros de Produtos

```
GET /api/products?search=harry+potter
GET /api/products?category=literatura
GET /api/products?condition=LIKE_NEW
GET /api/products?minPrice=10&maxPrice=50
GET /api/products?type=BOOK
GET /api/products?featured=true
GET /api/products?sort=price&order=asc
```

## Pagamentos

### PIX
1. Criar pedido: `POST /api/orders`
2. Iniciar pagamento: `POST /api/payments/initiate` (method: PIX)
3. Retorna: `pixCode` (copia e cola) e `pixQrCode` (QR code)

### Boleto
1. Iniciar pagamento: `POST /api/payments/initiate` (method: BOLETO)
2. Retorna: `boletoUrl` (link para download)

### Cartão
1. Iniciar pagamento: `POST /api/payments/initiate` (method: CREDIT_CARD)
2. Retorna: `clientSecret`
3. Usar Stripe.js no frontend para confirmar

## Métodos HTTP

| Método | Significado |
|--------|-------------|
| GET | Listar / Buscar |
| POST | Criar / Executar |
| PUT | Atualizar |
| DELETE | Excluir |

## Códigos de Resposta

| Código | Significado |
|--------|-------------|
| 200 | Sucesso |
| 201 | Criado |
| 400 | Requisição inválida |
| 401 | Não autenticado |
| 403 | Sem permissão |
| 404 | Não encontrado |
| 500 | Erro interno |

## Autenticação

Todas as rotas protegidas requerem header:
```
Authorization: Bearer <token>
```

O token é obtido no login ou registro.
