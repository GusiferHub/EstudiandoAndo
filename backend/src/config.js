import dotenv from 'dotenv';

dotenv.config();

const maxPdfMb = Number(process.env.MAX_PDF_MB ?? 20);

export const config = {
  port: Number(process.env.PORT ?? 3000),
  nodeEnv: process.env.NODE_ENV ?? 'development',
  databaseUrl: process.env.DATABASE_URL,
  geminiApiKey: process.env.GEMINI_API_KEY,
  geminiModel: process.env.GEMINI_MODEL ?? 'gemini-2.5-flash',
  corsOrigin: process.env.CORS_ORIGIN ?? 'http://localhost:8080',
  maxPdfMb: Number.isFinite(maxPdfMb) && maxPdfMb > 0 ? maxPdfMb : 20
};

export function validateConfig() {
  const missing = [];

  if (!config.databaseUrl) missing.push('DATABASE_URL');
  if (!config.geminiApiKey) missing.push('GEMINI_API_KEY');

  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
}

