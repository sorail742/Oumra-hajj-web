import { z } from "zod";

/**
 * `GET /documents/mine` ne publie pas de schéma de réponse dans
 * `openapi.json` — seul `UploadDocumentDto` y figure (champs d'écriture :
 * `bookingId`, `type`). Champs `id`/`status`/`rejectionReason` ajoutés
 * comme certainement présents sur une entité persistée. **À revérifier
 * contre une réponse réelle** — voir `docs/contrat-api.md`.
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
  createdAt: z.string().optional(),
});

export type PilgrimDocument = z.infer<typeof documentSchema>;

/**
 * `GET /documents/:id/access-url` ne publie pas non plus de schéma —
 * `url` est l'hypothèse la plus probable (voir `CalendarSubscriptionCard`,
 * même pattern d'URL signée côté agence). À corriger dès le premier appel
 * réel si le champ porte un autre nom.
 */
export const accessUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string().optional(),
});
