/**
 * Période du comparatif lue dans l'URL (règle 8) : trois dernières années
 * par défaut, dix au plus, jamais une requête que le backend refuserait.
 */
export const SAISONS_MAX = 10;

function annee(brut: string | null): number | undefined {
  if (brut === null || !/^\d{4}$/.test(brut)) return undefined;
  const n = Number(brut);
  return n >= 2000 && n <= 2100 ? n : undefined;
}

export function lirePeriode(
  params: URLSearchParams,
  anneeCourante: number,
): { fromYear: number; toYear: number } {
  const toYear = annee(params.get("to")) ?? anneeCourante;
  const fromYear = annee(params.get("from")) ?? toYear - 2;
  if (fromYear > toYear || toYear - fromYear + 1 > SAISONS_MAX) {
    return { fromYear: toYear - 2, toYear };
  }
  return { fromYear, toYear };
}
