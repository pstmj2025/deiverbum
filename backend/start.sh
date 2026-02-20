#!/bin/bash
cd /data/.openclaw/workspace/dei-verbum/backend
USE_PORT=$(shuf -i 30000-40000 -n 1)
echo "Usando porta temporária: $USE_PORT"
export PORT=$USE_PORT
npx tsx --no-cache src/index.ts 2>&1 | tee /tmp/dei-verbum.log
