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

/**
 * `AgencyShape` (`Oumra-hadj-project/src/types/agency.types.ts`, relu le
 * 2026-10-01). Les champs optionnels côté backend sont mappés `?? undefined`
 * (`toAgencyShape`) : ils sont absents du JSON, jamais `null`.
 */
export const agencyValidationStatusSchema = z.enum([
  "pending",
  "approved",
  "rejected",
]);
export type AgencyValidationStatus = z.infer<
  typeof agencyValidationStatusSchema
>;

export const legalDocumentSchema = z.object({
  id: z.string(),
  label: z.string(),
  storageRef: z.string(),
  uploadedAt: z.string(),
  expiresAt: z.string().optional(),
});

export const bankDetailsSchema = z.object({
  accountName: z.string(),
  accountNumber: z.string(),
  bankName: z.string(),
});

export const agencySchema = z.object({
  id: z.string(),
  legalName: z.string(),
  ownerId: z.string(),
  contactEmail: z.string(),
  contactPhone: z.string(),
  address: z.string().optional(),
  legalDocuments: z.array(legalDocumentSchema),
  validationStatus: agencyValidationStatusSchema,
  rejectionReason: z.string().optional(),
  validatedById: z.string().optional(),
  validatedAt: z.string().optional(),
  commissionRate: z.number(),
  bankDetails: bankDetailsSchema.optional(),
});
export type Agency = z.infer<typeof agencySchema>;
