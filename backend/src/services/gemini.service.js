import { GoogleGenAI } from '@google/genai';
import { readFile, unlink } from 'node:fs/promises';
import { config } from '../config.js';
import { AppError } from '../errors.js';
import { geminiResponseSchema, studyMaterialAiSchema } from '../schemas/studyMaterial.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

function buildPrompt(originalFilename) {
  return `
Analiza el PDF "${originalFilename}" y genera material de estudio en español.

Devuelve exclusivamente JSON válido con esta estructura:
- summary.title: título breve del contenido.
- summary.shortSummary: resumen claro de 2 a 4 párrafos.
- summary.keyPoints: lista de ideas clave.
- summary.studyPlan: lista de pasos concretos para estudiar el contenido.
- quiz: exactamente 10 preguntas.

Reglas obligatorias del quiz:
- 7 preguntas con type "multiple_choice".
- Cada multiple_choice debe tener exactamente 4 opciones.
- correctAnswer debe coincidir exactamente con una de las opciones.
- 3 preguntas con type "true_false".
- Para true_false, correctAnswer debe ser boolean.
- Cada pregunta debe incluir explanation breve y útil.
- No inventes información que no esté sustentada por el PDF.
`;
}

function extractResponseText(response) {
  if (typeof response.text === 'function') {
    return response.text();
  }

  if (typeof response.text === 'string') {
    return response.text;
  }

  const parts = response.candidates?.[0]?.content?.parts ?? [];
  return parts.map((part) => part.text ?? '').join('');
}

function parseJsonResponse(text) {
  try {
    return JSON.parse(text);
  } catch {
    const match = text.match(/\{[\s\S]*\}/);
    if (!match) {
      throw new AppError('Gemini no devolvió JSON válido.', 502, 'invalid_ai_response');
    }
    return JSON.parse(match[0]);
  }
}

async function uploadPdfToGemini(file) {
  try {
    return await ai.files.upload({
      file: file.path,
      config: {
        displayName: file.originalname,
        mimeType: file.mimetype
      }
    });
  } catch {
    const bytes = await readFile(file.path);
    return ai.files.upload({
      file: new Blob([bytes], { type: file.mimetype }),
      config: {
        displayName: file.originalname,
        mimeType: file.mimetype
      }
    });
  }
}

export async function generateStudyMaterialFromPdf(file) {
  let uploadedFile;

  try {
    uploadedFile = await uploadPdfToGemini(file);

    const response = await ai.models.generateContent({
      model: config.geminiModel,
      contents: [
        {
          role: 'user',
          parts: [
            { text: buildPrompt(file.originalname) },
            {
              fileData: {
                mimeType: uploadedFile.mimeType ?? file.mimetype,
                fileUri: uploadedFile.uri
              }
            }
          ]
        }
      ],
      config: {
        responseMimeType: 'application/json',
        responseSchema: geminiResponseSchema,
        temperature: 0.3
      }
    });

    const rawText = extractResponseText(response);
    const parsed = parseJsonResponse(rawText);
    return studyMaterialAiSchema.parse(parsed);
  } catch (error) {
    if (error instanceof AppError) {
      throw error;
    }

    if (error.name === 'ZodError') {
      throw new AppError('Gemini devolvió una estructura incompleta o inválida.', 502, 'invalid_ai_schema');
    }

    throw new AppError('No se pudo generar el material de estudio con Gemini.', 502, 'gemini_error');
  } finally {
    if (file?.path) {
      await unlink(file.path).catch(() => {});
    }
  }
}

