#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Se creo frontend/.env desde .env.production.example."
  echo "Edita VITE_API_URL antes de levantar el servicio."
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

echo "Frontend listo. Abre la IP publica de esta VPS."
