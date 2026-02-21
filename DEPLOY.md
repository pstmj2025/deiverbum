# 🚀 Guia de Deploy - DEI VERBUM

Deploy gratuito para teste e divulgação.

---

## 📋 Visão Geral

| Serviço | Plataforma | URL | Plano |
|---------|-----------|-----|-------|
| **Frontend** | Vercel | `dei-verbum.vercel.app` | Gratuito |
| **Backend** | Render | `dei-verbum-api.onrender.com` | Gratuito |
| **Banco de Dados** | Render PostgreSQL | Interno | Gratuito |
| **Cache** | Render Redis | Interno | Gratuito |

---

## 🎯 Etapas do Deploy

### 1️⃣ Backend + Banco (Render) - Primeiro!

1. Acesse [dashboard.render.com](https://dashboard.render.com)
2. Crie uma conta (gratuita) com GitHub
3. Clique em **"New" → "Blueprint"**
4. Conecte o repositório `pstmj2025/deiverbum`
5. O Render vai detectar o `render.yaml`
6. Clique em **"Apply"**

**Isso criará automaticamente:**
- ✅ API Node.js rodando
- ✅ PostgreSQL database
- ✅ Redis cache

**⚠️ Importante:** Anote a URL do serviço (ex: `https://dei-verbum-api.onrender.com`)

---

### 2️⃣ Frontend (Vercel)

1. Acesse [vercel.com](https://vercel.com)
2. Crie uma conta com GitHub
3. Clique em **"Add New..." → "Project"**
4. Importe o repositório `pstmj2025/deiverbum`
5. Configure:
   - **Framework:** Next.js
   - **Root Directory:** `./frontend`
   - **Build Command:** `npm run build`
   - **Output Directory:** `dist`
6. Adicione variável de ambiente:
   - `NEXT_PUBLIC_API_URL` = URL do backend (passo anterior)
7. Clique em **"Deploy"**

---

## ⚙️ Variáveis de Ambiente Necessárias

### Render (Backend)
Configure no Dashboard do Render → Environment Variables:

```bash
# Pagamentos (obrigatório para testar checkout)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
ASAAS_API_KEY=$aact_...
```

### Vercel (Frontend)
Configure em Project Settings → Environment Variables:

```bash
NEXT_PUBLIC_API_URL=https://dei-verbum-api.onrender.com
```

---

## 🔗 URLs Finais

Após o deploy:

```
🌐 Site:      https://dei-verbum.vercel.app
🔧 API:       https://dei-verbum-api.onrender.com
📊 Prisma:    https://dei-verbum-api.onrender.com/api/health
```

---

## 📱 Limitações do Plano Gratuito

| Recurso | Limite |
|---------|--------|
| Backend | Sleep após 15 min de inatividade (demora ~30s pra acordar) |
| Banco de dados | 1GB persistido |
| Redis | 25MB |
| Banda | 100GB/mês |

**Dica:** Para evitar "sleep" do backend em demos, acesse a URL antes de mostrar.

---

## 🔄 Atualizando o Código

```bash
# No seu terminal local
git add .
git commit -m "feat: novas funcionalidades"
git push origin master

# O deploy é automático!
```

---

## 🆘 Troubleshooting

### Backend não conecta no banco
Verifique se `DATABASE_URL` está configurada no Render Dashboard.

### Frontend não encontra API
Verifique `NEXT_PUBLIC_API_URL` no Vercel e se o backend está rodando.

### "Cold start" muito lento
Normal no plano gratuito. Aguarde 30-60s após primeira requisição.

---

## 📁 Arquivos de Configuração

- `vercel.json` - Configuração do Vercel
- `render.yaml` - Blueprint do Render (backend + db + redis)
- `frontend/next.config.js` - Configuração do Next.js

---

**"No princípio era o Verbo"** — João 1:1
