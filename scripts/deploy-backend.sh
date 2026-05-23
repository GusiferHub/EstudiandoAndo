#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Se creo backend/.env desde .env.production.example."
  echo "Edita GEMINI_API_KEY y CORS_ORIGIN antes de levantar el servicio."
  exit 1
fi

docker compose up -d --build
docker compose ps

echo "Backend listo. Valida con: curl http://localhost:3000/health"
