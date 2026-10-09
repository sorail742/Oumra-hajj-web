"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api, construireUrl } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";

/**
 * Piste d'audit (idée #85 — `AuditLogShape`,
 * `oumra-hajj-backend/src/types/audit.types.ts`, lu le 2026-10-08) :
 * lecture seule, administration uniquement.
 */
export const AUDIT_ACTIONS = [
  "agency.approve",
  "agency.reject",
  "agency.add_guide",
  "user.suspend",
  "user.reactivate",
  "document.validate",
  "document.reject",
  "payment.refund",
  "payment.status_callback",
  "refund_policy.update",
  "invoice.issue",
  "dispute.escalate",
  "dispute.decide",
  "booking.cancel",
  "group.assign_guide",
  "guide.unavailability_add",
  "guide.unavailability_delete",
  "rite_sheet.validate",
  "quiz_question.validate",
  "quiz_question.reject",
  "emergency_number.create",
  "emergency_number.update",
  "emergency_number.delete",
  "audit.export",
] as const;

/**
 * Clé de traduction d'une action : next-intl lit le point comme une
 * imbrication, il devient `__` (`payment.refund` → `payment__refund`).
 */
export function cleAction(action: string): string {
  return action.replaceAll(".", "__");
}

export const auditLogSchema = z.object({
  id: z.string(),
  actorId: z.string().optional(),
  actorName: z.string().optional(),
  actorRole: z.enum(["pilgrim", "agency", "guide", "admin"]).optional(),
  action: z.string(),
  entityType: z.string(),
  entityId: z.string().optional(),
  metadata: z
    .record(
      z.string(),
      z.union([z.string(), z.number(), z.boolean(), z.null()]),
    )
    .optional(),
  createdAt: z.string(),
});

export type AuditLog = z.infer<typeof auditLogSchema>;

export interface FiltresAudit {
  from?: string;
  to?: string;
  action?: string;
  entityId?: string;
}

export function useJournalAudit(filtres: FiltresAudit) {
  return useQuery({
    queryKey: keys.audit.list({ ...filtres }),
    queryFn: async () =>
      z.array(auditLogSchema).parse(
        await api.get<unknown>("/api/admin/audit", {
          params: { ...filtres },
        }),
      ),
  });
}

export function lienCsvAudit(filtres: FiltresAudit): string {
  return construireUrl("/api/admin/audit/csv", { ...filtres });
}
