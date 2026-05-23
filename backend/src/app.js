import cors from 'cors';
import express from 'express';
import multer from 'multer';
import { config } from './config.js';
import { AppError } from './errors.js';
import { studyMaterialsRouter } from './routes/studyMaterials.routes.js';

export function createApp() {
  const app = express();

  app.use(cors({
    origin: config.corsOrigin,
    methods: ['GET', 'POST', 'DELETE', 'OPTIONS']
  }));
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  app.use('/api/study-materials', studyMaterialsRouter);

  app.use((_req, _res, next) => {
    next(new AppError('Ruta no encontrada', 404, 'route_not_found'));
  });

  app.use((error, _req, res, _next) => {
    if (error instanceof multer.MulterError) {
      const message = error.code === 'LIMIT_FILE_SIZE'
        ? `El PDF supera el límite de ${config.maxPdfMb} MB.`
        : 'No se pudo procesar el archivo.';
      res.status(400).json({ error: { code: error.code, message } });
      return;
    }

    const statusCode = error.statusCode ?? 500;
    const code = error.code ?? 'internal_error';
    const message = statusCode >= 500 ? 'Ocurrió un error inesperado.' : error.message;

    if (statusCode >= 500) {
      console.error(error);
    }

    res.status(statusCode).json({ error: { code, message } });
  });

  return app;
}

