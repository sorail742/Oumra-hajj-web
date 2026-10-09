import { z } from "zod";
import type { LoyaltyTier } from "../api/schemas";

/**
 * Formulaire des paliers de fidélité (idée #47) : saisie en chaînes,
 * convertie ici, testée. Mêmes bornes que le backend (1–50 voyages,
 * libellé 2–40, avantage 2–200, seuils distincts).
 */
interface Messages {
  tripsInvalid: string;
  labelInvalid: string;
  benefitInvalid: string;
  duplicate: string;
}

export function schemaPaliers(m: Messages) {
  return z
    .object({
      tiers: z.array(
        z.object({
          minTrips: z
            .string()
            .trim()
            .refine(
              (v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 50,
              m.tripsInvalid,
            ),
          label: z
            .string()
            .trim()
            .min(2, m.labelInvalid)
            .max(40, m.labelInvalid),
          benefit: z
            .string()
            .trim()
            .min(2, m.benefitInvalid)
            .max(200, m.benefitInvalid),
        }),
      ),
    })
    .superRefine((v, ctx) => {
      const vus = new Set<string>();
      v.tiers.forEach((t, i) => {
        const cle = String(Number(t.minTrips));
        if (vus.has(cle)) {
          ctx.addIssue({
            code: "custom",
            path: ["tiers", i, "minTrips"],
            message: m.duplicate,
          });
        }
        vus.add(cle);
      });
    });
}

export type ValeursPaliers = z.infer<ReturnType<typeof schemaPaliers>>;

export function versValeurs(paliers: readonly LoyaltyTier[]): ValeursPaliers {
  return {
    tiers: paliers.map((p) => ({
      minTrips: String(p.minTrips),
      label: p.label,
      benefit: p.benefit,
    })),
  };
}

/** Paliers envoyés, triés par nombre de voyages. */
export function versPaliers(v: ValeursPaliers): LoyaltyTier[] {
  return v.tiers
    .map((t) => ({
      minTrips: Number(t.minTrips),
      label: t.label.trim(),
      benefit: t.benefit.trim(),
    }))
    .sort((a, b) => a.minTrips - b.minTrips);
}
