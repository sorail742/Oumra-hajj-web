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
