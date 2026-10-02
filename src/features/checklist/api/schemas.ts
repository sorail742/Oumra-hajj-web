import { z } from "zod";

/**
 * `ChecklistItem` (`prisma/schema.prisma` backend, relu le 2026-10-02) —
 * réponse brute Prisma de `GET /checklist/bookings/:bookingId` et de
 * `PATCH /checklist/:id/status`. `category` est une chaîne libre côté
 * backend (« document », « vaccine », « luggage », « spiritual ») : on la
 * garde en `string` et l'interface retombe sur « Autre » pour une valeur
 * inconnue. Les champs techniques (`reminderSent`, horodatages) sont
 * retirés par zod.
 */
export const checklistItemSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  title: z.string(),
  category: z.string(),
  isCompleted: z.boolean(),
  reminderDate: z.string().nullable().optional(),
});

export type ChecklistItem = z.infer<typeof checklistItemSchema>;
