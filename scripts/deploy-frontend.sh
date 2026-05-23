#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../frontend"

if [ ! -f .env ]; then
  cp .env.production.example .env
  echo "Se creo frontend/.env desde .env.production.example."
  echo "Edita VITE_API_URL antes de levantar el servicio."
  exit 1
fi

docker compose up -d --build
docker compose ps

echo "Frontend listo. Abre la IP publica de esta VPS."
