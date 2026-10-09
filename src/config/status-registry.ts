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
  /**
   * `LegalDocumentComplianceStatus` — 10ᵉ enum, ajouté au registre en
   * construisant le domaine conformité documentaire agence (voir
   * `docs/design-system.md` §7, `LegalDocumentComplianceList` : « distingue
   * visuellement expired (state-danger) de expiring_soon (state-warning) »).
   */
  legalDocument: {
    expired: { label: "Expiré", tone: "danger" },
    expiring_soon: { label: "Expire bientôt", tone: "warning" },
  },
  /** `User.isActive` (ticket #74) — compte actif ou suspendu par l'admin. */
  userAccount: {
    active: { label: "Actif", tone: "success" },
    suspended: { label: "Suspendu", tone: "danger" },
  },
  /**
   * `DocumentExpiryStatus` (ticket #57) — date d'expiration d'une pièce du
   * pèlerin croisée avec les dates du voyage (`GET /documents/expiry-alerts`).
   */
  documentExpiry: {
    expired: { label: "Expiré", tone: "danger" },
    expires_before_trip: { label: "Expire avant le retour", tone: "danger" },
    expires_soon_after_trip: {
      label: "Expire peu après le retour",
      tone: "warning",
    },
  },
  /**
   * `RiteSheet.isValidated` — fiche de rite publiée ou en attente de
   * relecture par une personne qualifiée (CLAUDE.md, contenu religieux).
   */
  riteSheet: {
    validated: { label: "Validée", tone: "success" },
    pending: { label: "À valider", tone: "warning" },
  },
  /**
   * Ancienneté d'une position partagée (ADR-0007) — dérivée de `updatedAt`
   * par `features/groups/lib/suivi.ts`, pas un enum d'API, mais un statut
   * affiché comme les autres : sa couleur se décide ici.
   */
  locationFreshness: {
    live: { label: "En direct", tone: "success" },
    recent: { label: "Récente", tone: "progress" },
    stale: { label: "Ancienne", tone: "pending" },
  },
  /**
   * `DisputeStatus` (idée #62) — médiation : dialogue pèlerin-agence,
   * puis arbitrage de l'administration si besoin.
   */
  dispute: {
    open: { label: "En attente de l'agence", tone: "pending" },
    agency_responded: { label: "Réponse de l'agence", tone: "progress" },
    escalated: { label: "Arbitrage en cours", tone: "warning" },
    resolved: { label: "Résolu à l'amiable", tone: "success" },
    closed: { label: "Tranché", tone: "success" },
  },
  /**
   * Devis groupes et entreprises (backend idée #49) : `expired` n'est pas un
   * statut de l'API mais l'état d'un devis `sent` dont la validité est
   * passée (champ `expired`), affiché comme tel.
   */
  quote: {
    draft: { label: "Brouillon", tone: "pending" },
    sent: { label: "Envoyé", tone: "progress" },
    accepted: { label: "Accepté", tone: "success" },
    declined: { label: "Refusé", tone: "danger" },
    expired: { label: "Expiré", tone: "warning" },
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
