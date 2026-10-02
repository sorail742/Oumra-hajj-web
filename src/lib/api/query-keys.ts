/**
 * Fabrique centrale des clés TanStack Query.
 *
 * **Interdit d'écrire un tableau de clé en dur dans un composant.** C'est la
 * première cause de cache qui ne s'invalide pas.
 *
 * La hiérarchie permet d'invalider par niveau : `keys.bookings.all` invalide
 * listes et détails d'un coup.
 *
 * Domaines calqués sur les modules réels du backend
 * (`Oumra-hadj-project/src/modules/`) — à compléter au fur et à mesure des
 * écrans, pas à remplir par anticipation d'un endpoint qui n'existe pas
 * encore.
 */

type Filtres = Record<string, unknown>;

export const keys = {
  admin: {
    all: ["admin"] as const,
    stats: () => [...keys.admin.all, "stats"] as const,
    users: (f: Filtres) => [...keys.admin.all, "users", f] as const,
  },
  notifications: {
    all: ["notifications"] as const,
    list: (f: Filtres) => [...keys.notifications.all, "list", f] as const,
  },
  agencies: {
    all: ["agencies"] as const,
    me: () => [...keys.agencies.all, "me"] as const,
    list: (f: Filtres) => [...keys.agencies.all, "list", f] as const,
    detail: (id: string) => [...keys.agencies.all, "detail", id] as const,
    legalDocuments: () => [...keys.agencies.all, "legal-documents"] as const,
    complianceAlerts: () =>
      [...keys.agencies.all, "compliance-alerts"] as const,
    calendarSubscription: () =>
      [...keys.agencies.all, "calendar-subscription"] as const,
  },

  packages: {
    all: ["packages"] as const,
    list: (f: Filtres) => [...keys.packages.all, "list", f] as const,
    mine: () => [...keys.packages.all, "mine"] as const,
    detail: (id: string) => [...keys.packages.all, "detail", id] as const,
  },

  bookings: {
    all: ["bookings"] as const,
    list: (f: Filtres) => [...keys.bookings.all, "list", f] as const,
    detail: (id: string) => [...keys.bookings.all, "detail", id] as const,
    tripSummary: (id: string) =>
      [...keys.bookings.all, "trip-summary", id] as const,
  },

  documents: {
    all: ["documents"] as const,
    mine: () => [...keys.documents.all, "mine"] as const,
    byBooking: (bookingId: string) =>
      [...keys.documents.all, "booking", bookingId] as const,
    accessUrl: (id: string) =>
      [...keys.documents.all, "access-url", id] as const,
    expiryAlerts: (bookingId: string) =>
      [...keys.documents.all, "expiry-alerts", bookingId] as const,
  },

  payments: {
    all: ["payments"] as const,
    mine: () => [...keys.payments.all, "mine"] as const,
    agency: () => [...keys.payments.all, "agency"] as const,
    detail: (id: string) => [...keys.payments.all, "detail", id] as const,
    byBooking: (bookingId: string) =>
      [...keys.payments.all, "booking", bookingId] as const,
    /**
     * Statut de réservation minimal, pour l'aperçu du barème de
     * remboursement (`RefundRequestFlow`). Clé distincte de
     * `keys.bookings.detail` : un `features/x` n'importe jamais depuis
     * `features/y` (voir `CLAUDE.md` règle 2), donc ce hook reparse sa
     * propre forme minimale plutôt que de réutiliser le cache du domaine
     * `bookings` — partager la clé mélangerait deux formes différentes
     * sous la même entrée de cache.
     */
    bookingStatus: (bookingId: string) =>
      [...keys.payments.all, "booking-status", bookingId] as const,
  },

  reviews: {
    all: ["reviews"] as const,
    mine: () => [...keys.reviews.all, "mine"] as const,
    byAgency: (agencyId: string) =>
      [...keys.reviews.all, "agency", agencyId] as const,
    trustScore: (agencyId: string) =>
      [...keys.reviews.all, "trust-score", agencyId] as const,
    satisfactionReport: () =>
      [...keys.reviews.all, "satisfaction-report"] as const,
  },

  rites: {
    all: ["rites"] as const,
    sheets: (f: Filtres = {}) => [...keys.rites.all, "sheets", f] as const,
    myProgress: () => [...keys.rites.all, "my-progress"] as const,
  },

  groups: {
    all: ["groups"] as const,
    mine: () => [...keys.groups.all, "mine"] as const,
    assigned: () => [...keys.groups.all, "assigned"] as const,
    joined: () => [...keys.groups.all, "joined"] as const,
    detail: (id: string) => [...keys.groups.all, "detail", id] as const,
  },

  messaging: {
    all: ["messaging"] as const,
    conversation: (bookingId: string, channel: string) =>
      [...keys.messaging.all, "conversation", bookingId, channel] as const,
    messages: (conversationId: string) =>
      [...keys.messaging.all, "messages", conversationId] as const,
  },

  checklist: {
    all: ["checklist"] as const,
    byBooking: (bookingId: string) =>
      [...keys.checklist.all, "booking", bookingId] as const,
  },

  auth: {
    all: ["auth"] as const,
    /**
     * Identité de l'utilisateur courant (`GET /users/me`, voir
     * `lib/auth/use-current-user.ts`). Le rôle de `<Can>` reste lu dans le
     * payload du JWT (UI seulement, règle 12).
     */
    me: () => [...keys.auth.all, "me"] as const,
  },
} as const;
