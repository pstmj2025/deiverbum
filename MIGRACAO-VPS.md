# 🚀 Migração para VPS Hostinger

## ✅ Resumo
Este guia migra tudo do Render (gratuito) para sua VPS Hostinger Docker.

## 🎯 O que vai acontecer
- ✅ Backend 24/7 online (nunca dorme!)
- ✅ Banco de dados local (mais rápido)
- ✅ SSL com Let's Encrypt (opcional)
- ✅ Domínio próprio (opcional)

---

## 📋 Pré-requisitos na VPS

```bash
# Verificar se Docker está instalado
docker --version
docker compose version

# Se não estiver, instale:
curl -fsSL https://get.docker.com | sh
```

---

## 🚀 EXECUTAR MIGRAÇÃO

### **Passo 1: Baixar e executar script**

```bash
# Acesse sua VPS via SSH
ssh root@SEU-IP-DA-VPS

# Baixar o script
curl -o migrar.sh https://raw.githubusercontent.com/pstmj2025/deiverbum/master/migrar-vps.sh

# Tornar executável
chmod +x migrar.sh

# EXECUTAR!
./migrar.sh
```

### **Passo 2: Aguardar (~5 minutos)**

O script vai:
1. ✅ Clonar/atualizar o repositório
2. ✅ Criar containers Docker
3. ✅ Configurar PostgreSQL
4. ✅ Subir backend
5. ✅ Rodar migrations

### **Passo 3: Verificar se funcionou**

```bash
# Ver containers rodando
docker ps

# Testar API
curl http://localhost:3000/health
```

---

## 🔗 ATUALIZAR FRONTEND

### Opção A: Manter na Vercel (recomendado)

Edite o arquivo `frontend/src/lib/axios.ts`:

```typescript
const API_URL = 'http://SEU-IP-DA-VPS:3000' // <-- Mude aqui!
```

### Opção B: Frontend também na VPS

Descomente no `docker-compose.production.yml`:

```yaml
frontend:
  build:
    context: ./frontend
  ports:
    - "80:3000"
```

---

## 🔒 SSL (Recomendado)

Se tiver domínio próprio:

```bash
# Instalar certbot
docker run -it --rm \
  -v "$(pwd)/certbot:/etc/letsencrypt" \
  -p 80:80 certbot/certbot certonly --standalone -d seusite.com
```

---

## 🔄 COMANDOS ÚTEIS

```bash
# Ver logs
docker logs -f dei-verbum-api

# Reiniciar
docker compose -f docker-compose.production.yml restart

# Atualizar (pull + rebuild)
cd ~/deiverbum && git pull && docker compose -f docker-compose.production.yml up -d --build

# Parar tudo
docker compose -f docker-compose.production.yml down

# Backup do banco
docker exec dei-verbum-db pg_dump -U dei_verbum dei_verbum > backup.sql
```

---

## 🆘 TROUBLESHOOTING

### Erro: "port 3000 already in use"
```bash
# Ver o que usa porta 3000
lsof -i :3000

# Ou mudar porta no docker-compose
ports:
  - "3001:3000"  # <-- Mude para 3001
```

### Erro: "database connection failed"
```bash
# Verificar se PostgreSQL subiu
docker logs dei-verbum-db

# Reiniciar
docker compose -f docker-compose.production.yml restart db
```

---

## ✅ PÓS-MIGRAÇÃO

1. ✅ Teste: `curl http://IP-DA-VPS:3000/health`
2. ✅ Frontend: Aponte para novo IP
3. ✅ Monitoramento: Configure uptime robot (gratuito)
4. ✅ Backups: Automatize com cron

---

## 🎯 STATUS ATUAL

| Componente | Antes (Render) | Depois (VPS) |
|------------|----------------|--------------|
| Disponibilidade | ❌ Dormia | ✅ 24/7 |
| Performance | ⚠️ Lenta | ✅ Rápida |
| Controle | ❌ Limitado | ✅ Total |
| Banco | ❌ Externo | ✅ Local |

---

**Pronto! Siga o Passo 1 para começar!** 🚀
