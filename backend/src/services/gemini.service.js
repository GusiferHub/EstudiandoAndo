import { GoogleGenAI } from '@google/genai';
import { readFile, unlink } from 'node:fs/promises';
import { config } from '../config.js';
import { AppError } from '../errors.js';
import { studyMaterialAiSchema } from '../schemas/studyMaterial.js';

const ai = new GoogleGenAI({ apiKey: config.geminiApiKey });

function buildPrompt(originalFilename) {
  return `
Analiza el PDF "${originalFilename}" y genera material de estudio en espanol.

Devuelve exclusivamente JSON valido, sin markdown, sin explicaciones fuera del JSON, con esta estructura:
{
  "summary": {
    "title": "string",
    "shortSummary": "string",
    "keyPoints": ["string"],
    "studyPlan": ["string"]
  },
  "quiz": [
    {
      "type": "multiple_choice",
      "question": "string",
      "options": ["string", "string", "string", "string"],
      "correctAnswer": "string",
      "explanation": "string"
    },
    {
      "type": "true_false",
      "question": "string",
      "correctAnswer": true,
      "explanation": "string"
    }
  ]
}

Reglas obligatorias del quiz:
- 10 preguntas en total.
- 7 preguntas con type "multiple_choice".
- Cada multiple_choice debe tener exactamente 4 opciones.
- correctAnswer debe coincidir exactamente con una de las opciones.
- 3 preguntas con type "true_false".
- Para true_false, correctAnswer debe ser boolean.
- Cada pregunta debe incluir explanation breve y util.
- No inventes informacion que no este sustentada por el PDF.
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
      throw new AppError('Gemini no devolvio JSON valido.', 502, 'invalid_ai_response');
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
  } catch (pathUploadError) {
    console.error('Gemini file path upload failed, retrying with Blob:', serializeGeminiError(pathUploadError));

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

function serializeGeminiError(error) {
  return {
    name: error?.name,
    message: error?.message,
    status: error?.status,
    statusCode: error?.statusCode,
    code: error?.code,
    details: error?.details,
    cause: error?.cause?.message,
    stack: error?.stack
  };
}

export async function generateStudyMaterialFromPdf(file) {
  try {
    const uploadedFile = await uploadPdfToGemini(file);

    if (!uploadedFile?.uri) {
      console.error('Gemini file upload response without uri:', uploadedFile);
      throw new AppError('Gemini no devolvio una URI valida para el PDF.', 502, 'invalid_ai_file_upload');
    }

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
      console.error('Gemini schema validation failed:', error.errors);
      throw new AppError('Gemini devolvio una estructura incompleta o invalida.', 502, 'invalid_ai_schema');
    }

    console.error('Gemini generation failed:', serializeGeminiError(error));
    throw new AppError('No se pudo generar el material de estudio con Gemini.', 502, 'gemini_error');
  } finally {
    if (file?.path) {
      await unlink(file.path).catch(() => {});
    }
  }
}
