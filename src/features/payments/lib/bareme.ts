import type { RefundTier } from "../api/use-refund-policy";

/** Ligne saisie du barème : textes bruts des deux champs. */
export interface LigneBareme {
  jours: string;
  pourcentage: string;
}

export type ErreurBareme = "invalid" | "duplicate" | "increasing";

const ENTIER = /^\d+$/;

/**
 * Lignes saisies → paliers, triés du plus lointain au plus proche. Mêmes
 * règles que le backend (`verifierPaliers`) : seuils distincts, taux qui ne
 * remonte jamais à l'approche du départ. Le backend revérifie.
 */
export function lireBareme(
  lignes: readonly LigneBareme[],
): { paliers: RefundTier[] } | { erreur: ErreurBareme } {
  const paliers: RefundTier[] = [];
  for (const { jours, pourcentage } of lignes) {
    const j = jours.trim();
    const p = pourcentage.trim();
    if (!ENTIER.test(j) || !ENTIER.test(p)) return { erreur: "invalid" };
    const nbJours = Number(j);
    const taux = Number(p);
    if (nbJours > 730 || taux > 100) return { erreur: "invalid" };
    paliers.push({ minDaysBeforeDeparture: nbJours, rate: taux / 100 });
  }
  paliers.sort((a, b) => b.minDaysBeforeDeparture - a.minDaysBeforeDeparture);
  for (let i = 1; i < paliers.length; i += 1) {
    const precedent = paliers[i - 1];
    const courant = paliers[i];
    if (!precedent || !courant) continue;
    if (precedent.minDaysBeforeDeparture === courant.minDaysBeforeDeparture) {
      return { erreur: "duplicate" };
    }
    if (courant.rate > precedent.rate) return { erreur: "increasing" };
  }
  return { paliers };
}

export function versLignes(paliers: readonly RefundTier[]): LigneBareme[] {
  return paliers.map((p) => ({
    jours: String(p.minDaysBeforeDeparture),
    pourcentage: String(Math.round(p.rate * 100)),
  }));
}
