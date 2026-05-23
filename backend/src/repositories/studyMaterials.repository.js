import { pool } from '../db.js';
import { notFound } from '../errors.js';

export async function createStudyMaterial({ originalFilename, summary, quiz }) {
  const result = await pool.query(
    `INSERT INTO study_materials (original_filename, summary, quiz)
     VALUES ($1, $2::jsonb, $3::jsonb)
     RETURNING id, original_filename, summary, quiz, created_at`,
    [originalFilename, JSON.stringify(summary), JSON.stringify(quiz)]
  );

  return mapStudyMaterial(result.rows[0]);
}

export async function listStudyMaterials() {
  const result = await pool.query(
    `SELECT id, original_filename, summary, quiz, created_at
     FROM study_materials
     ORDER BY created_at DESC`
  );

  return result.rows.map(mapStudyMaterial);
}

export async function getStudyMaterialById(id) {
  const result = await pool.query(
    `SELECT id, original_filename, summary, quiz, created_at
     FROM study_materials
     WHERE id = $1`,
    [id]
  );

  if (result.rowCount === 0) {
    throw notFound('Material de estudio no encontrado');
  }

  return mapStudyMaterial(result.rows[0]);
}

export async function deleteStudyMaterialById(id) {
  const result = await pool.query('DELETE FROM study_materials WHERE id = $1 RETURNING id', [id]);

  if (result.rowCount === 0) {
    throw notFound('Material de estudio no encontrado');
  }
}

function mapStudyMaterial(row) {
  return {
    id: row.id,
    originalFilename: row.original_filename,
    summary: row.summary,
    quiz: row.quiz,
    createdAt: row.created_at
  };
}


