# StudyLock

App universitaria full stack para subir un PDF, generar un resumen y crear un quiz interactivo de aprendizaje con Gemini.

- `frontend/`: React + Vite servido con Nginx en Docker.
- `backend/`: Node.js + Express + PostgreSQL + Gemini en Docker.

## Requisitos

- Docker y Docker Compose.
- Una API key de Gemini.
- Dos VPS Ubuntu si se despliega separado, o una maquina local para pruebas.

## Backend local con PostgreSQL

```bash
cd backend
cp .env.example .env
docker compose up --build
```

El backend queda en `http://localhost:3000`.

## Frontend local con Docker

En otra terminal:

```bash
cd frontend
cp .env.example .env
docker compose up --build
```

El frontend queda en `http://localhost:8080`.

## Despliegue en 2 VPS

La guia completa esta en [docs/DEPLOYMENT.md](docs/DEPLOYMENT.md).

Resumen:

- VPS Backend: abrir puerto `3000`, configurar `backend/.env`, ejecutar `docker compose up -d --build`.
- VPS Frontend: abrir puerto `80`, configurar `frontend/.env`, ejecutar `docker compose up -d --build`.
- En backend, `CORS_ORIGIN` debe apuntar al frontend.
- En frontend, `VITE_API_URL` debe apuntar al backend.

## Variables importantes

Backend:

- `GEMINI_API_KEY`: API key de Gemini.
- `DATABASE_URL`: conexion PostgreSQL interna de Docker.
- `CORS_ORIGIN`: origen permitido del frontend.
- `MAX_PDF_MB`: tamano maximo permitido para PDFs.
- `GEMINI_MODEL`: modelo Gemini a usar.

Frontend:

- `VITE_API_URL`: URL publica del backend.
- `FRONTEND_PORT`: puerto publicado por Docker, `8080` local o `80` en VPS.

## Endpoints

- `GET /health`
- `POST /api/study-materials`
- `GET /api/study-materials`
- `GET /api/study-materials/:id`
- `DELETE /api/study-materials/:id`
