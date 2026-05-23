# Despliegue StudyLock en 2 VPS

Guia pensada para una entrega rapida usando Oracle Cloud Always Free con dos VPS Ubuntu 24.04 ARM64. Tambien funciona en AWS EC2 u otro proveedor con Ubuntu y Docker.

## Arquitectura

```text
Usuario -> http://IP_PUBLICA_FE
Frontend Docker/Nginx -> http://IP_PUBLICA_BE:3000
Backend Docker/Express -> postgres://study_user:study_password@postgres:5432/study_app
Backend -> Gemini API
```

## Proveedor recomendado

Usa Oracle Cloud Always Free si te deja crear instancias `VM.Standard.A1.Flex`.

- `studylock-fe`: 1 OCPU, 6 GB RAM.
- `studylock-be`: 2 OCPU, 12 GB RAM.
- Imagen: Ubuntu 24.04.

Puertos a abrir en la red cloud:

- FE: `80/tcp`
- BE: `3000/tcp`
- SSH: `22/tcp`

Si Oracle no tiene capacidad, usa AWS como fallback para la demo y apaga las instancias despues de la entrega.

## Preparar cada VPS

En la VPS de frontend y en la VPS de backend:

```bash
sudo apt update
sudo apt install -y docker.io docker-compose-plugin git curl
sudo systemctl enable --now docker
sudo usermod -aG docker "$USER"
```

Cierra sesion SSH y vuelve a entrar para usar Docker sin `sudo`.

## VPS Backend

Sube o clona el proyecto y entra a `backend`:

```bash
cd studyLock/backend
cp .env.production.example .env
nano .env
```

Configura:

```env
PORT=3000
NODE_ENV=production
DATABASE_URL=postgres://study_user:study_password@postgres:5432/study_app
GEMINI_API_KEY=TU_API_KEY_NUEVA
GEMINI_MODEL=gemini-2.5-flash
CORS_ORIGIN=http://IP_PUBLICA_FE
MAX_PDF_MB=20
POSTGRES_DB=study_app
POSTGRES_USER=study_user
POSTGRES_PASSWORD=study_password
```

Levanta backend y PostgreSQL:

```bash
docker compose up -d --build
docker compose ps
curl http://localhost:3000/health
```

Desde tu computadora valida:

```text
http://IP_PUBLICA_BE:3000/health
```

## VPS Frontend

Sube o clona el proyecto y entra a `frontend`:

```bash
cd studyLock/frontend
cp .env.production.example .env
nano .env
```

Configura:

```env
VITE_API_URL=http://IP_PUBLICA_BE:3000
FRONTEND_PORT=80
```

Levanta el frontend:

```bash
docker compose up -d --build
docker compose ps
```

Abre:

```text
http://IP_PUBLICA_FE
```

## Validacion final

1. Abre `http://IP_PUBLICA_BE:3000/health`.
2. Abre `http://IP_PUBLICA_FE`.
3. Sube un PDF pequeno.
4. Confirma resumen, puntos clave, plan de estudio y quiz.
5. Responde el quiz y envia respuestas.
6. Recarga la pagina y confirma que el historial sigue disponible.
7. Reinicia backend:

```bash
cd studyLock/backend
docker compose restart
```

8. Confirma que los resultados guardados siguen en el historial.

## Notas importantes

- No subas `backend/.env` a GitHub.
- Si una API key de Gemini se expuso en chat, consola o repo, regenerala antes de desplegar.
- `docker compose down` conserva la base de datos.
- `docker compose down -v` borra el volumen de PostgreSQL y todos los datos.
