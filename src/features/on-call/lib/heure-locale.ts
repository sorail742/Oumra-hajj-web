import { TZDate } from "@date-fns/tz";
import { FUSEAU_PRODUIT } from "@/lib/format";

/**
 * Valeur d'un `<input type="datetime-local">` (`2026-11-01T08:00`) lue
 * comme une heure du fuseau du produit, quel que soit le fuseau du
 * navigateur, puis convertie en ISO pour l'API. `undefined` si illisible.
 */
export function heureLocaleVersIso(valeur: string): string | undefined {
  const m = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(valeur);
  if (!m) return undefined;
  const [, a, mo, j, h, mi] = m.map(Number) as [
    number,
    number,
    number,
    number,
    number,
    number,
  ];
  const date = new TZDate(a, mo - 1, j, h, mi, FUSEAU_PRODUIT);
  return Number.isNaN(date.getTime())
    ? undefined
    : new Date(date.getTime()).toISOString();
}
