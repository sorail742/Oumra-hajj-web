import type { Payment } from "../api/schemas";

export function paiementsEnAttente(paiements: Payment[]): Payment[] {
  return paiements.filter((p) => p.status === "pending");
}

/** Paiement réussi dont la date de confirmation est connue. */
export type PaiementConfirme = Payment & { confirmedAt: string };

/**
 * Derniers paiements confirmés, du plus récent au plus ancien.
 * `PaymentShape` n'a pas de date de création : seul `confirmedAt` permet
 * d'ordonner, donc seuls les paiements réussis sont « récents ».
 */
export function paiementsRecents(
  paiements: Payment[],
  nombre: number,
): PaiementConfirme[] {
  return paiements
    .filter(
      (p): p is PaiementConfirme =>
        p.status === "succeeded" && p.confirmedAt !== undefined,
    )
    .sort((a, b) => b.confirmedAt.localeCompare(a.confirmedAt))
    .slice(0, nombre);
}
