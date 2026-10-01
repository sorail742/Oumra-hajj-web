import type { Group, ItineraryStep } from "../api/schemas";

/**
 * Prochaine étape d'itinéraire à partir de `maintenant` (incluse le jour
 * même) ; `undefined` si l'itinéraire est vide ou entièrement passé.
 */
export function prochaineEtapeItineraire(
  groupe: Group,
  maintenant: Date,
): ItineraryStep | undefined {
  const debutDuJour = new Date(maintenant);
  debutDuJour.setUTCHours(0, 0, 0, 0);
  return [...groupe.itinerary]
    .filter((e) => new Date(e.date).getTime() >= debutDuJour.getTime())
    .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())[0];
}
