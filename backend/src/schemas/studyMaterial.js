import { z } from 'zod';

export const summarySchema = z.object({
  title: z.string().min(1),
  shortSummary: z.string().min(1),
  keyPoints: z.array(z.string().min(1)).min(3),
  studyPlan: z.array(z.string().min(1)).min(3)
});

const multipleChoiceQuestionSchema = z.object({
  type: z.literal('multiple_choice'),
  question: z.string().min(1),
  options: z.array(z.string().min(1)).length(4),
  correctAnswer: z.string().min(1),
  explanation: z.string().min(1)
});

const trueFalseQuestionSchema = z.object({
  type: z.literal('true_false'),
  question: z.string().min(1),
  correctAnswer: z.boolean(),
  explanation: z.string().min(1)
});

export const quizQuestionSchema = z.discriminatedUnion('type', [
  multipleChoiceQuestionSchema,
  trueFalseQuestionSchema
]);

export const studyMaterialAiSchema = z.object({
  summary: summarySchema,
  quiz: z.array(quizQuestionSchema).length(10)
}).superRefine((value, ctx) => {
  const multipleChoiceCount = value.quiz.filter((question) => question.type === 'multiple_choice').length;
  const trueFalseCount = value.quiz.filter((question) => question.type === 'true_false').length;

  if (multipleChoiceCount !== 7) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El quiz debe tener exactamente 7 preguntas de opción múltiple',
      path: ['quiz']
    });
  }

  if (trueFalseCount !== 3) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'El quiz debe tener exactamente 3 preguntas de verdadero/falso',
      path: ['quiz']
    });
  }

  value.quiz.forEach((question, index) => {
    if (question.type === 'multiple_choice' && !question.options.includes(question.correctAnswer)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'La respuesta correcta debe existir dentro de las opciones',
        path: ['quiz', index, 'correctAnswer']
      });
    }
  });
});

export const geminiResponseSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        shortSummary: { type: 'string' },
        keyPoints: {
          type: 'array',
          items: { type: 'string' }
        },
        studyPlan: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['title', 'shortSummary', 'keyPoints', 'studyPlan']
    },
    quiz: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          type: {
            type: 'string',
            enum: ['multiple_choice', 'true_false']
          },
          question: { type: 'string' },
          options: {
            type: 'array',
            items: { type: 'string' }
          },
          correctAnswer: {
            anyOf: [
              { type: 'string' },
              { type: 'boolean' }
            ]
          },
          explanation: { type: 'string' }
        },
        required: ['type', 'question', 'correctAnswer', 'explanation']
      }
    }
  },
  required: ['summary', 'quiz']
};
