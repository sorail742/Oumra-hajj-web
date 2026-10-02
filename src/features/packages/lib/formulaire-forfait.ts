import { z } from "zod";
import type { Package } from "../api/schemas";

/**
 * Formulaire de forfait (ticket #33) : schéma de saisie, conversion vers le
 * corps de `CreatePackageDto` / `UpdatePackageDto`, et pré-remplissage
 * depuis un forfait existant. Les dates restent au format `AAAA-MM-JJ` du
 * champ `<input type="date">`, accepté par `@IsDateString()`.
 */

export interface MessagesFormulaire {
  titleTooShort: string;
  required: string;
  priceInvalid: string;
  capacityInvalid: string;
  endBeforeStart: string;
  stagesRequired: string;
}

const ENTIER_POSITIF = /^\d+$/;

/** Dates `AAAA-MM-JJ` : la fin ne précède pas le début. */
function finApresDebut(debut: string, fin: string): boolean {
  return fin.localeCompare(debut) >= 0;
}

export function schemaFormulaireForfait(m: MessagesFormulaire) {
  const date = z.string().min(1, m.required);
  const etape = z
    .object({
      city: z.string().trim().min(1, m.required),
      hotelName: z.string().trim().min(1, m.required),
      distanceToMosqueMeters: z.string().trim(),
      startDate: date,
      endDate: date,
    })
    .refine((e) => finApresDebut(e.startDate, e.endDate), {
      path: ["endDate"],
      message: m.endBeforeStart,
    });

  return z
    .object({
      type: z.enum(["oumra", "hadj"]),
      title: z.string().trim().min(3, m.titleTooShort),
      description: z.string().trim(),
      startDate: date,
      endDate: date,
      price: z
        .string()
        .trim()
        .refine((v) => ENTIER_POSITIF.test(v) && Number(v) > 0, m.priceInvalid),
      capacity: z
        .string()
        .trim()
        .refine(
          (v) => ENTIER_POSITIF.test(v) && Number(v) > 0,
          m.capacityInvalid,
        ),
      stages: z.array(etape).min(1, m.stagesRequired),
      inclusions: z.string(),
    })
    .refine((v) => finApresDebut(v.startDate, v.endDate), {
      path: ["endDate"],
      message: m.endBeforeStart,
    });
}

export type ValeursForfait = z.infer<
  ReturnType<typeof schemaFormulaireForfait>
>;

export interface CorpsForfait {
  type: "oumra" | "hadj";
  title: string;
  description?: string;
  startDate: string;
  endDate: string;
  price: number;
  currency: "GNF";
  capacity: number;
  stages: {
    city: string;
    hotelName: string;
    distanceToMosqueMeters?: number;
    startDate: string;
    endDate: string;
  }[];
  inclusions: string[];
}

/** Une inclusion par ligne ; lignes vides ignorées. */
export function versCorps(v: ValeursForfait): CorpsForfait {
  return {
    type: v.type,
    title: v.title,
    ...(v.description ? { description: v.description } : {}),
    startDate: v.startDate,
    endDate: v.endDate,
    price: Number(v.price),
    currency: "GNF",
    capacity: Number(v.capacity),
    stages: v.stages.map((e) => ({
      city: e.city,
      hotelName: e.hotelName,
      ...(ENTIER_POSITIF.test(e.distanceToMosqueMeters)
        ? { distanceToMosqueMeters: Number(e.distanceToMosqueMeters) }
        : {}),
      startDate: e.startDate,
      endDate: e.endDate,
    })),
    inclusions: v.inclusions
      .split("\n")
      .map((ligne) => ligne.trim())
      .filter(Boolean),
  };
}

const jour = (iso: string) => iso.slice(0, 10);

export const ETAPE_VIDE = {
  city: "",
  hotelName: "",
  distanceToMosqueMeters: "",
  startDate: "",
  endDate: "",
};

export function valeursInitiales(forfait?: Package): ValeursForfait {
  if (!forfait) {
    return {
      type: "oumra",
      title: "",
      description: "",
      startDate: "",
      endDate: "",
      price: "",
      capacity: "",
      stages: [{ ...ETAPE_VIDE }],
      inclusions: "",
    };
  }
  return {
    type: forfait.type,
    title: forfait.title,
    description: forfait.description ?? "",
    startDate: jour(forfait.startDate),
    endDate: jour(forfait.endDate),
    price: String(forfait.price),
    capacity: String(forfait.capacity),
    stages:
      forfait.stages.length > 0
        ? forfait.stages.map((e) => ({
            city: e.city,
            hotelName: e.hotelName,
            distanceToMosqueMeters:
              e.distanceToMosqueMeters === undefined
                ? ""
                : String(e.distanceToMosqueMeters),
            startDate: jour(e.startDate),
            endDate: jour(e.endDate),
          }))
        : [{ ...ETAPE_VIDE }],
    inclusions: forfait.inclusions.join("\n"),
  };
}
