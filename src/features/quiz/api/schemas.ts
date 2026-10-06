import { z } from "zod";

/**
 * Formes du module quiz — `src/types/quiz.types.ts` du backend, publiées
 * dans `openapi.json` (`QuizQuestionShape`, `QuizQuestionAdminShape`,
 * `QuizAttemptResultShape`, `QuizStatsShape`).
 */

/** Question vue par le pèlerin : ni bonne réponse ni explication. */
export const quizQuestionSchema = z.object({
  id: z.string(),
  riteSheetId: z.string(),
  question: z.string(),
  options: z.array(z.string()),
});
export type QuizQuestion = z.infer<typeof quizQuestionSchema>;

/** Question complète (guide, administrateur). */
export const quizQuestionAdminSchema = quizQuestionSchema.extend({
  correctOption: z.number().int(),
  explanation: z.string().nullable(),
  isValidated: z.boolean(),
  createdAt: z.string(),
});
export type QuizQuestionAdmin = z.infer<typeof quizQuestionAdminSchema>;

/** Résultat d'une tentative : la correction est révélée. */
export const quizAttemptResultSchema = z.object({
  id: z.string(),
  questionId: z.string(),
  selectedOption: z.number().int(),
  isCorrect: z.boolean(),
  correctOption: z.number().int(),
  explanation: z.string().nullable(),
});
export type QuizAttemptResult = z.infer<typeof quizAttemptResultSchema>;

export const quizStatsSchema = z.object({
  totalAttempts: z.number().int(),
  correctAttempts: z.number().int(),
  scorePercentage: z.number(),
  attempts: z.array(
    z.object({
      id: z.string(),
      isCorrect: z.boolean(),
      question: z.object({ riteSheetId: z.string() }),
    }),
  ),
});
export type QuizStats = z.infer<typeof quizStatsSchema>;
