import { z } from "zod";

/**
 * `DisputeShape` (`oumra-hajj-backend/src/types/dispute.types.ts`, idée
 * #62, lu le 2026-10-08) — médiation : dialogue pèlerin-agence, puis
 * arbitrage de l'administration. `messages` n'est présent que dans le
 * détail.
 */
export const DISPUTE_CATEGORIES = [
  "payment",
  "refund",
  "accommodation",
  "transport",
  "documents",
  "service",
  "other",
] as const;
export type DisputeCategory = (typeof DISPUTE_CATEGORIES)[number];

export const DISPUTE_STATUSES = [
  "open",
  "agency_responded",
  "escalated",
  "resolved",
  "closed",
] as const;
export type DisputeStatus = (typeof DISPUTE_STATUSES)[number];

export const disputeMessageSchema = z.object({
  id: z.string(),
  authorRole: z.enum(["pilgrim", "agency", "guide", "admin"]),
  authorName: z.string(),
  content: z.string(),
  createdAt: z.string(),
});

export const disputeSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  packageTitle: z.string(),
  agencyId: z.string(),
  agencyName: z.string(),
  pilgrimName: z.string(),
  category: z.enum(DISPUTE_CATEGORIES),
  subject: z.string(),
  status: z.enum(DISPUTE_STATUSES),
  decision: z.string().optional(),
  escalatedAt: z.string().optional(),
  closedAt: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string(),
  escalationAvailableAt: z.string(),
  messages: z.array(disputeMessageSchema).optional(),
});

export type Dispute = z.infer<typeof disputeSchema>;
export type DisputeMessage = z.infer<typeof disputeMessageSchema>;

export interface NouveauLitige {
  bookingId: string;
  category: DisputeCategory;
  subject: string;
  message: string;
}

/** Litige encore ouvert au dialogue (messages, escalade, clôture). */
export function estActif(statut: DisputeStatus): boolean {
  return (
    statut === "open" || statut === "agency_responded" || statut === "escalated"
  );
}

/**
 * Escalade possible : après une réponse de l'agence, ou sans réponse
 * passé le délai qui lui est laissé. Le backend tranche en dernier.
 */
export function peutEscalader(
  litige: Dispute,
  maintenant = Date.now(),
): boolean {
  return (
    litige.status === "agency_responded" ||
    (litige.status === "open" &&
      new Date(litige.escalationAvailableAt).getTime() <= maintenant)
  );
}
