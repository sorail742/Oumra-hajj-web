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
 * commentaire de `GroupsService.findAuthorizedOrFail`). Consommée
 * aujourd'hui seulement pour compter les positions partagées, jamais
 * affichée sur une carte (aucune bibliothèque cartographique dans la
 * pile — voir `docs/socle-frontend.md` §2 — à ajouter seulement si un
 * écran réel l'exige).
 */
export const memberLocationSchema = z.object({
  userId: z.string(),
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
