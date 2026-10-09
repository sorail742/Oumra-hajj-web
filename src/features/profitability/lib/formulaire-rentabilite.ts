import { z } from "zod";
import type { HypothesesRentabilite } from "../api/schemas";

/**
 * Formulaire du simulateur de rentabilité (idée #48). Les montants restent
 * des chaînes saisies ; la conversion en hypothèses envoyées au backend est
 * ici, testée, plutôt que dans le composant.
 */
const MONTANT = /^\d+([.,]\d{1,2})?$/;
const ENTIER = /^\d+$/;

export const NOUVELLE_OFFRE = "";

interface Messages {
  amountInvalid: string;
  labelRequired: string;
  integerInvalid: string;
  priceRequired: string;
  capacityRequired: string;
  expectedTooHigh: string;
}

export function schemaRentabilite(m: Messages) {
  const ligne = z.object({
    label: z.string().trim().min(1, m.labelRequired).max(80),
    amount: z.string().trim().regex(MONTANT, m.amountInvalid),
  });
  const entierOptionnel = z
    .string()
    .trim()
    .refine((v) => v === "" || ENTIER.test(v), m.integerInvalid);
  return z
    .object({
      packageId: z.string(),
      price: z
        .string()
        .trim()
        .refine((v) => v === "" || MONTANT.test(v), m.amountInvalid),
      capacity: entierOptionnel,
      expectedPilgrims: entierOptionnel,
      costsPerPilgrim: z.array(ligne).max(30),
      fixedCosts: z.array(ligne).max(30),
    })
    .superRefine((v, ctx) => {
      // Sans forfait existant, prix et capacité sont les seules sources.
      if (v.packageId !== NOUVELLE_OFFRE) return;
      if (v.price === "") {
        ctx.addIssue({
          code: "custom",
          path: ["price"],
          message: m.priceRequired,
        });
      }
      if (v.capacity === "" || Number(v.capacity) < 1) {
        ctx.addIssue({
          code: "custom",
          path: ["capacity"],
          message: m.capacityRequired,
        });
      }
      if (
        v.capacity !== "" &&
        v.expectedPilgrims !== "" &&
        Number(v.expectedPilgrims) > Number(v.capacity)
      ) {
        ctx.addIssue({
          code: "custom",
          path: ["expectedPilgrims"],
          message: m.expectedTooHigh,
        });
      }
    });
}

export type ValeursRentabilite = z.infer<ReturnType<typeof schemaRentabilite>>;

const nombre = (v: string) => Number(v.replace(",", "."));

export function versHypotheses(v: ValeursRentabilite): HypothesesRentabilite {
  const lignes = (l: ValeursRentabilite["fixedCosts"]) =>
    l.map((x) => ({ label: x.label.trim(), amount: nombre(x.amount) }));
  return {
    ...(v.packageId !== NOUVELLE_OFFRE && { packageId: v.packageId }),
    ...(v.price !== "" && { price: nombre(v.price) }),
    ...(v.capacity !== "" && { capacity: Number(v.capacity) }),
    ...(v.expectedPilgrims !== "" && {
      expectedPilgrims: Number(v.expectedPilgrims),
    }),
    costsPerPilgrim: lignes(v.costsPerPilgrim),
    fixedCosts: lignes(v.fixedCosts),
  };
}
