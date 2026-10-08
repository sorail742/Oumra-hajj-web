import { z } from "zod";

/**
 * `EmergencyNumberShape` / `MyEmergencyContactsShape`
 * (`oumra-hajj-backend/src/types/emergency.types.ts`, idée #21, lu le
 * 2026-10-08). Optionnels mappés `?? undefined` : absents du JSON.
 */
export const CATEGORIES_URGENCE = [
  "police",
  "medical",
  "civil_defense",
  "embassy",
  "other",
] as const;

export const emergencyNumberSchema = z.object({
  id: z.string(),
  label: z.string(),
  category: z.enum(CATEGORIES_URGENCE),
  phone: z.string(),
  country: z.string(),
  city: z.string().optional(),
  notes: z.string().optional(),
  order: z.number(),
});

export const myEmergencyContactsSchema = z.object({
  agencies: z.array(
    z.object({
      agencyId: z.string(),
      legalName: z.string(),
      phone: z.string(),
    }),
  ),
  guides: z.array(
    z.object({
      groupId: z.string(),
      groupTitle: z.string(),
      fullName: z.string(),
      phone: z.string().optional(),
    }),
  ),
});

export type EmergencyNumber = z.infer<typeof emergencyNumberSchema>;
export type EmergencyCategory = EmergencyNumber["category"];
export type MyEmergencyContacts = z.infer<typeof myEmergencyContactsSchema>;
