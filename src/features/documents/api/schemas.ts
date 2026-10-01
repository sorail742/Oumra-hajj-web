import { z } from "zod";

/**
 * `PilgrimDocumentShape` (`Oumra-hadj-project/src/types/document.types.ts`,
 * relu le 2026-10-01) — même forme pour `GET /documents/mine`,
 * `GET /documents?bookingId=` et les réponses de `PATCH .../validate` et
 * `.../reject`. Optionnels mappés `?? undefined` côté backend : absents du
 * JSON, jamais `null`. `pilgrimId` et `storageRef` (référence interne de
 * stockage) sont volontairement hors schéma : zod les retire de la donnée
 * parsée, ils ne circulent donc pas dans l'interface (règle 14).
 */
export const documentSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  type: z.enum([
    "passport",
    "visa",
    "flight_ticket",
    "vaccination_certificate",
  ]),
  status: z.enum(["pending", "validated", "rejected"]),
  rejectionReason: z.string().optional(),
  expiresAt: z.string().optional(),
});

/** `RejectDocumentDto` : `reason` chaîne, 3 caractères minimum. */
export const LONGUEUR_MIN_MOTIF_REFUS = 3;

export type PilgrimDocument = z.infer<typeof documentSchema>;

/**
 * `GET /documents/:id/access-url` ne publie pas de schéma dans
 * `openapi.json`, mais renvoie l'interface partagée `AccessUrl`
 * (`Oumra-hadj-project/src/modules/storage/storage-provider.interface.ts`,
 * vérifiée le 2026-09-17 — corrige une hypothèse antérieure : `expiresAt`
 * n'est pas optionnel). Même forme pour `GET /agencies/me/legal-documents/
 * :id/access-url` (voir `features/agencies/api/schemas.ts`).
 */
export const accessUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string(),
});
