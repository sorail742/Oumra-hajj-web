import { z } from "zod";

/**
 * Vérifié directement contre le code source du backend
 * (`Oumra-hadj-project/src/types/agency.types.ts`,
 * `LegalDocumentAlertShape`, lu le 2026-09-17).
 */
export const legalDocumentAlertSchema = z.object({
  id: z.string(),
  label: z.string(),
  expiresAt: z.string(),
  status: z.enum(["expired", "expiring_soon"]),
});

export type LegalDocumentAlert = z.infer<typeof legalDocumentAlertSchema>;

/**
 * Interface `AccessUrl` partagée côté backend
 * (`src/modules/storage/storage-provider.interface.ts`) — même forme que
 * `features/documents/api/schemas.ts`, dupliquée ici plutôt qu'importée :
 * un `features/x` n'importe jamais `features/y` (règle 2).
 */
export const accessUrlSchema = z.object({
  url: z.string(),
  expiresAt: z.string(),
});

export const agencySchema = z.object({
  id: z.string().uuid(),
  legalName: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  address: z.string().nullable().optional(),
  status: z.enum(["pending", "approved", "rejected"]),
  createdAt: z.string().optional(),
});
export type Agency = z.infer<typeof agencySchema>;
