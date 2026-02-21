#!/bin/bash
# DEI VERBUM - Script de inicialização completa
# Caminho detectado: /docker/openclaw-vsaa/data/.openclaw/workspace/dei-verbum

WORKSPACE="/docker/openclaw-vsaa/data/.openclaw/workspace/dei-verbum"

echo "🎩 Iniciando DEI VERBUM..."

# Verificar backend
curl -s http://localhost:5000/health > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🚀 Iniciando backend..."
    cd "$WORKSPACE/backend"
    PORT=5000 nohup npx tsx src/index.ts > /tmp/dei-verbum.log 2>&1 &
    sleep 5
else
    echo "✅ Backend já rodando"
fi

# Verificar frontend
curl -s http://localhost:8080 > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🌐 Iniciando frontend..."
    cd "$WORKSPACE/frontend/public_html"
    nohup python3 -m http.server 8080 > /tmp/frontend-server.log 2>&1 &
else
    echo "✅ Frontend já rodando"
fi

echo ""
echo "=========================================="
echo "🎩 DEI VERBUM - STATUS"
echo "=========================================="
echo ""
echo "🌐 LOJA:     http://187.77.45.220:8080"
echo "🔌 API:      http://187.77.45.220:5000"
echo "📊 Health:   http://187.77.45.220:5000/health"
echo ""
echo "=========================================="
