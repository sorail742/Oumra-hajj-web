import { z } from "zod";

/**
 * `OnCallShiftShape`, `OnCallCoverageShape`, `MyOnCallShape`
 * (`oumra-hajj-backend/src/types/on-call.types.ts`, idée #63, lu le
 * 2026-10-09) — astreinte 24/7 de l'agence pendant le voyage.
 */
export const ON_CALL_ROLES = [
  "guide",
  "coordinator",
  "manager",
  "other",
] as const;
export type OnCallRole = (typeof ON_CALL_ROLES)[number];

export const onCallShiftSchema = z.object({
  id: z.string(),
  packageId: z.string().optional(),
  packageTitle: z.string().optional(),
  staffName: z.string(),
  staffRole: z.enum(ON_CALL_ROLES),
  phone: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
  notes: z.string().optional(),
});

const periodeSchema = z.object({ from: z.string(), to: z.string() });

export const onCallCoverageSchema = z.object({
  packageId: z.string(),
  packageTitle: z.string(),
  from: z.string(),
  to: z.string(),
  coveredHours: z.number(),
  totalHours: z.number(),
  gaps: z.array(periodeSchema),
});

export const onCallContactSchema = z.object({
  staffName: z.string(),
  staffRole: z.enum(ON_CALL_ROLES),
  phone: z.string(),
  startsAt: z.string(),
  endsAt: z.string(),
});

export const myOnCallSchema = z.object({
  bookingId: z.string(),
  agencyName: z.string(),
  agencyPhone: z.string(),
  current: z.array(onCallContactSchema),
  next: onCallContactSchema.optional(),
});

export type OnCallShift = z.infer<typeof onCallShiftSchema>;
export type OnCallCoverage = z.infer<typeof onCallCoverageSchema>;
export type OnCallContact = z.infer<typeof onCallContactSchema>;
export type MyOnCall = z.infer<typeof myOnCallSchema>;

export interface NouveauCreneau {
  packageId?: string;
  staffName: string;
  staffRole: OnCallRole;
  phone: string;
  startsAt: string;
  endsAt: string;
  notes?: string;
}
