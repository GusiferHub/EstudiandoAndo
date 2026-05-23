import { Router } from 'express';
import multer from 'multer';
import { randomUUID } from 'node:crypto';
import { mkdir } from 'node:fs/promises';
import { extname, join } from 'node:path';
import { config } from '../config.js';
import { AppError } from '../errors.js';
import {
  createStudyMaterial,
  deleteStudyMaterialById,
  getStudyMaterialById,
  listStudyMaterials
} from '../repositories/studyMaterials.repository.js';
import { generateStudyMaterialFromPdf } from '../services/gemini.service.js';

const uploadDir = join(process.cwd(), 'uploads');
const uuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
await mkdir(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (_req, file, cb) => {
    cb(null, `${randomUUID()}${extname(file.originalname) || '.pdf'}`);
  }
});

const upload = multer({
  storage,
  limits: {
    fileSize: config.maxPdfMb * 1024 * 1024
  },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype !== 'application/pdf') {
      cb(new AppError('Solo se permiten archivos PDF.', 400, 'invalid_file_type'));
      return;
    }

    cb(null, true);
  }
});

export const studyMaterialsRouter = Router();

studyMaterialsRouter.post('/', upload.single('pdf'), async (req, res, next) => {
  try {
    if (!req.file) {
      throw new AppError('Debes enviar un archivo PDF en el campo "pdf".', 400, 'missing_pdf');
    }

    const material = await generateStudyMaterialFromPdf(req.file);
    const saved = await createStudyMaterial({
      originalFilename: req.file.originalname,
      summary: material.summary,
      quiz: material.quiz
    });

    res.status(201).json(saved);
  } catch (error) {
    next(error);
  }
});

studyMaterialsRouter.get('/', async (_req, res, next) => {
  try {
    res.json(await listStudyMaterials());
  } catch (error) {
    next(error);
  }
});

studyMaterialsRouter.get('/:id', async (req, res, next) => {
  try {
    assertValidId(req.params.id);
    res.json(await getStudyMaterialById(req.params.id));
  } catch (error) {
    next(error);
  }
});

studyMaterialsRouter.delete('/:id', async (req, res, next) => {
  try {
    assertValidId(req.params.id);
    await deleteStudyMaterialById(req.params.id);
    res.status(204).send();
  } catch (error) {
    next(error);
  }
});

function assertValidId(id) {
  if (!uuidPattern.test(id)) {
    throw new AppError('El ID del material no es válido.', 400, 'invalid_id');
  }
}
