import { z } from "zod";

/**
 * `QuoteShape`, `SharedQuoteShape` (`oumra-hajj-backend/src/types/quote.types.ts`,
 * idée #49, lu le 2026-10-09). Totaux toujours calculés par le backend :
 * jamais recalculés ni envoyés par le navigateur.
 */
export const QUOTE_STATUSES = [
  "draft",
  "sent",
  "accepted",
  "declined",
] as const;
export type QuoteStatus = (typeof QUOTE_STATUSES)[number];

export const QUOTE_CLIENT_TYPES = [
  "company",
  "mosque",
  "association",
  "other",
] as const;
export type QuoteClientType = (typeof QUOTE_CLIENT_TYPES)[number];

const ligneSchema = z.object({
  label: z.string(),
  quantity: z.number(),
  unitPrice: z.number(),
  total: z.number(),
});

const totauxSchema = z.object({
  currency: z.string(),
  lines: z.array(ligneSchema),
  subtotal: z.number(),
  discountRate: z.number(),
  discountAmount: z.number(),
  totalAmount: z.number(),
});

export const quoteSchema = totauxSchema.extend({
  id: z.string(),
  number: z.string(),
  packageId: z.string().optional(),
  packageTitle: z.string().optional(),
  clientName: z.string(),
  clientType: z.enum(QUOTE_CLIENT_TYPES),
  contactName: z.string(),
  contactPhone: z.string().optional(),
  contactEmail: z.string().optional(),
  pilgrimsCount: z.number(),
  conditions: z.string().optional(),
  validUntil: z.string(),
  status: z.enum(QUOTE_STATUSES),
  expired: z.boolean(),
  shareToken: z.string().optional(),
  sentAt: z.string().optional(),
  respondedAt: z.string().optional(),
  createdAt: z.string(),
});

export const sharedQuoteSchema = totauxSchema.extend({
  number: z.string(),
  issuer: z.object({
    name: z.string(),
    phone: z.string(),
    email: z.string(),
    address: z.string().optional(),
  }),
  clientName: z.string(),
  packageTitle: z.string().optional(),
  pilgrimsCount: z.number(),
  conditions: z.string().optional(),
  validUntil: z.string(),
  status: z.enum(QUOTE_STATUSES),
  expired: z.boolean(),
  respondedAt: z.string().optional(),
});

export type Quote = z.infer<typeof quoteSchema>;
export type SharedQuote = z.infer<typeof sharedQuoteSchema>;
export type QuoteTotals = z.infer<typeof totauxSchema>;

/** Statut affiché : un devis envoyé dont la validité est passée est « expiré ». */
export function statutAffiche(d: {
  status: QuoteStatus;
  expired: boolean;
}): QuoteStatus | "expired" {
  return d.expired ? "expired" : d.status;
}

export interface NouveauDevis {
  packageId?: string;
  clientName: string;
  clientType: QuoteClientType;
  contactName: string;
  contactPhone?: string;
  contactEmail?: string;
  pilgrimsCount: number;
  lines: { label: string; quantity: number; unitPrice: number }[];
  discountRate?: number;
  conditions?: string;
  validUntil: string;
}
