import { z } from "zod";

/**
 * Vérifié directement contre le code source du backend
 * (`Oumra-hadj-project/src/types/group.types.ts`, `GroupShape`, lu le
 * 2026-09-17).
 */
export const itineraryStepSchema = z.object({
  label: z.string(),
  date: z.string(),
  location: z.string().optional(),
});

/**
 * Position d'un membre — donnée sensible et opt-in côté backend (voir le
 * commentaire de `GroupsService.findAuthorizedOrFail`), affichée par
 * l'écran de suivi (ADR-0007) et la liste du détail de groupe.
 * `fullName` : nom du membre joint par le backend depuis le 2026-10-08 ;
 * facultatif ici tant qu'un backend plus ancien peut répondre — l'écran
 * retombe alors sur « Membre n ».
 */
export const memberLocationSchema = z.object({
  userId: z.string(),
  fullName: z.string().optional(),
  lat: z.number(),
  lng: z.number(),
  updatedAt: z.string(),
});

export const groupSchema = z.object({
  id: z.string(),
  packageId: z.string(),
  agencyId: z.string(),
  title: z.string(),
  guideId: z.string().optional(),
  memberIds: z.array(z.string()),
  itinerary: z.array(itineraryStepSchema),
  locations: z.array(memberLocationSchema),
});

export type Group = z.infer<typeof groupSchema>;
export type ItineraryStep = z.infer<typeof itineraryStepSchema>;
