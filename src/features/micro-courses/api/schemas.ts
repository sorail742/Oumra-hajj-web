import { z } from "zod";

/**
 * `MicroCourseShape` / `MicroCourseProgressShape`
 * (`src/types/micro-course.types.ts` du backend, relu le 2026-10-02).
 * `description` vaut `null` quand absente ; `category` est une chaîne
 * libre (`preparation`, `rites`, `health`, `logistics` aujourd'hui).
 */
export const CATEGORIES_MICRO_COURS = [
  "preparation",
  "rites",
  "health",
  "logistics",
] as const;

export const microCourseSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string().nullable(),
  videoUrl: z.string(),
  durationSeconds: z.number().int().nonnegative(),
  order: z.number().int(),
  category: z.string(),
});
export type MicroCourse = z.infer<typeof microCourseSchema>;

export const microCourseProgressSchema = z.object({
  courseId: z.string(),
  isCompleted: z.boolean(),
});
export type MicroCourseProgress = z.infer<typeof microCourseProgressSchema>;
