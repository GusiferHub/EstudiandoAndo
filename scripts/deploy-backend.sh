#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Se creo backend/.env desde .env.production.example."
  echo "Edita GEMINI_API_KEY y CORS_ORIGIN antes de levantar el servicio."
  exit 1
fi

if docker compose version >/dev/null 2>&1; then
  COMPOSE="docker compose"
elif command -v docker-compose >/dev/null 2>&1; then
  COMPOSE="docker-compose"
else
  echo "No se encontro Docker Compose. Instala docker-compose o docker-compose-plugin."
  exit 1
fi

$COMPOSE up -d --build
$COMPOSE ps

echo "Backend listo. Valida con: curl http://localhost:3000/health"
