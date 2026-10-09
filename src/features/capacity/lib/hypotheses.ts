import {
  RATIO_MAX,
  RATIO_MIN,
  RATIO_PAR_DEFAUT,
  RECRUES_MAX,
} from "../api/schemas";

/**
 * Hypothèses du simulateur lues dans l'URL (règle 8) : une valeur absente,
 * illisible ou hors bornes retombe sur la valeur par défaut, jamais une
 * requête que le backend refuserait.
 */
function entierDans(
  brut: string | null,
  min: number,
  max: number,
  defaut: number,
): number {
  if (brut === null || !/^\d+$/.test(brut)) return defaut;
  const n = Number(brut);
  return n >= min && n <= max ? n : defaut;
}

export function lireHypotheses(params: URLSearchParams): {
  ratio: number;
  recrues: number;
} {
  return {
    ratio: entierDans(
      params.get("ratio"),
      RATIO_MIN,
      RATIO_MAX,
      RATIO_PAR_DEFAUT,
    ),
    recrues: entierDans(params.get("extra"), 0, RECRUES_MAX, 0),
  };
}
