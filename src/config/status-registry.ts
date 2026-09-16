/**
 * LE seul endroit où un statut d'API reçoit une couleur (un « ton ») et un
 * libellé français — voir `docs/design-system.md` §2 et §7. Jamais un
 * mapping local dans un écran ou un composant : `<StatusBadge kind="…"
 * value="…" />` consomme ce registre, point.
 *
 * Cinq tons sémantiques, pas un jeu de couleurs par enum — le contrat API
 * expose neuf enums porteurs de statut, mais leurs valeurs se regroupent
 * naturellement en cinq tons (voir la table de correspondance du design
 * system). Valeurs vérifiées contre `docs/contrat-api.md` et
 * `openapi.json` ; à ajuster si le backend introduit une valeur d'enum non
 * couverte ici plutôt que de la laisser tomber dans un statut par défaut
 * silencieux.
 */

export type Tone = "pending" | "progress" | "success" | "danger" | "warning";

interface StatusEntry {
  label: string;
  tone: Tone;
}

export const statusRegistry = {
  booking: {
    pending_payment: { label: "Paiement en attente", tone: "pending" },
    confirmed: { label: "Confirmée", tone: "success" },
    cancelled: { label: "Annulée", tone: "danger" },
    completed: { label: "Terminée", tone: "success" },
  },
  payment: {
    pending: { label: "En attente", tone: "pending" },
    succeeded: { label: "Réussi", tone: "success" },
    failed: { label: "Échoué", tone: "danger" },
    refunded: { label: "Remboursé", tone: "warning" },
  },
  document: {
    pending: { label: "En attente de validation", tone: "pending" },
    validated: { label: "Validé", tone: "success" },
    rejected: { label: "Refusé", tone: "danger" },
  },
  agency: {
    pending: { label: "En attente de validation", tone: "pending" },
    approved: { label: "Approuvée", tone: "success" },
    rejected: { label: "Refusée", tone: "danger" },
  },
  package: {
    open: { label: "Ouvert", tone: "pending" },
    full: { label: "Complet", tone: "warning" },
    closed: { label: "Clôturé", tone: "warning" },
  },
  dossierStep: {
    pending: { label: "À faire", tone: "pending" },
    in_progress: { label: "En cours", tone: "progress" },
    done: { label: "Terminée", tone: "success" },
  },
} as const satisfies Record<string, Record<string, StatusEntry>>;

export type StatusKind = keyof typeof statusRegistry;

export type StatusValue<K extends StatusKind> =
  keyof (typeof statusRegistry)[K];

export function statusEntry<K extends StatusKind>(
  kind: K,
  value: string,
): StatusEntry {
  const registre = statusRegistry[kind] as Record<string, StatusEntry>;
  const entree = registre[value];
  if (!entree) {
    // Valeur d'enum non couverte par le registre : plutôt que de masquer
    // silencieusement un statut inconnu, on le signale visuellement — un
    // registre incomplet doit se voir, pas se deviner en revue de code.
    return { label: value, tone: "pending" };
  }
  return entree;
}
