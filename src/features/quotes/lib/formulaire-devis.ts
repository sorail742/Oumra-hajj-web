import { z } from "zod";
import { QUOTE_CLIENT_TYPES, type NouveauDevis } from "../api/schemas";

/**
 * Formulaire de devis (idée #49) : saisie en chaînes, convertie ici et
 * testée. Aucun total n'est calculé ni envoyé : le backend s'en charge. La
 * remise se saisit en pourcentage (0–50), envoyée en fraction.
 */
const MONTANT = /^\d+([.,]\d{1,2})?$/;
const ENTIER = /^\d+$/;
const FORMAT_E164 = /^\+\d{8,15}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const SANS_FORFAIT = "";

interface Messages {
  required: string;
  integerInvalid: string;
  amountInvalid: string;
  discountInvalid: string;
  phoneInvalid: string;
  emailInvalid: string;
  dateInvalid: string;
}

const entierDans = (min: number, max: number) => (v: string) =>
  ENTIER.test(v) && Number(v) >= min && Number(v) <= max;

export function schemaDevis(m: Messages) {
  return z.object({
    packageId: z.string(),
    clientName: z.string().trim().min(2, m.required).max(120),
    clientType: z.enum(QUOTE_CLIENT_TYPES),
    contactName: z.string().trim().min(2, m.required).max(120),
    contactPhone: z
      .string()
      .trim()
      .refine((v) => v === "" || FORMAT_E164.test(v), m.phoneInvalid),
    contactEmail: z
      .string()
      .trim()
      .refine((v) => v === "" || EMAIL.test(v), m.emailInvalid),
    pilgrimsCount: z
      .string()
      .trim()
      .refine(entierDans(1, 10000), m.integerInvalid),
    lines: z
      .array(
        z.object({
          label: z.string().trim().min(1, m.required).max(120),
          quantity: z
            .string()
            .trim()
            .refine(entierDans(1, 10000), m.integerInvalid),
          unitPrice: z.string().trim().regex(MONTANT, m.amountInvalid),
        }),
      )
      .min(1)
      .max(30),
    discountPercent: z
      .string()
      .trim()
      .refine(
        (v) =>
          v === "" ||
          (/^\d+([.,]\d)?$/.test(v) && Number(v.replace(",", ".")) <= 50),
        m.discountInvalid,
      ),
    conditions: z.string().trim().max(2000),
    validUntil: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, m.dateInvalid),
  });
}

export type ValeursDevis = z.infer<ReturnType<typeof schemaDevis>>;

const nombre = (v: string) => Number(v.replace(",", "."));

export function versNouveauDevis(v: ValeursDevis): NouveauDevis {
  const remise = v.discountPercent === "" ? 0 : nombre(v.discountPercent);
  return {
    ...(v.packageId !== SANS_FORFAIT && { packageId: v.packageId }),
    clientName: v.clientName.trim(),
    clientType: v.clientType,
    contactName: v.contactName.trim(),
    ...(v.contactPhone && { contactPhone: v.contactPhone }),
    ...(v.contactEmail && { contactEmail: v.contactEmail }),
    pilgrimsCount: Number(v.pilgrimsCount),
    lines: v.lines.map((l) => ({
      label: l.label.trim(),
      quantity: Number(l.quantity),
      unitPrice: nombre(l.unitPrice),
    })),
    ...(remise > 0 && { discountRate: Math.round(remise * 10) / 1000 }),
    ...(v.conditions && { conditions: v.conditions }),
    // Fin de journée à Conakry (UTC) : valable toute la journée indiquée.
    validUntil: `${v.validUntil}T23:59:59.000Z`,
  };
}
