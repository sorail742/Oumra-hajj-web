import type { RiteSheet } from "../api/schemas";

/**
 * File de modération (ticket #62) : les fiches à valider d'abord — c'est
 * le travail en attente de la personne qualifiée —, puis les fiches
 * publiées ; chaque groupe dans l'ordre du parcours (`order`).
 */
export function fileDeModeration(fiches: readonly RiteSheet[]): RiteSheet[] {
  return [...fiches].sort(
    (a, b) =>
      Number(a.isValidated) - Number(b.isValidated) || a.order - b.order,
  );
}
