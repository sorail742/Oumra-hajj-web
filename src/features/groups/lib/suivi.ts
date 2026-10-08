import type { Group } from "../api/schemas";

/**
 * Logique pure de l'écran de suivi (ADR-0007) : qui est qui, depuis quand
 * la position est connue, à quelle distance du guide. Aucune coordonnée
 * n'est journalisée ni conservée au-delà de l'écran.
 */

export type RolePosition = "moi" | "guide" | "membre";

/** Ancienneté d'une position — clé `locationFreshness` du registre. */
export type Fraicheur = "live" | "recent" | "stale";

export interface PositionSuivie {
  userId: string;
  role: RolePosition;
  /** Numéro d'ordre parmi les membres (« Membre 2 »), `0` sinon. */
  numero: number;
  lat: number;
  lng: number;
  updatedAt: string;
}

const MINUTE_MS = 60_000;
/** Envoi au plus une fois par minute (`LocationSharingCard`) : 3 min = en direct. */
const SEUIL_DIRECT_MS = 3 * MINUTE_MS;
const SEUIL_RECENT_MS = 30 * MINUTE_MS;

export function fraicheur(updatedAt: string, maintenant: number): Fraicheur {
  const age = maintenant - Date.parse(updatedAt);
  if (age <= SEUIL_DIRECT_MS) return "live";
  if (age <= SEUIL_RECENT_MS) return "recent";
  return "stale";
}

/**
 * Positions du groupe, la plus récente d'abord, avec le rôle de chacun vu
 * par l'utilisateur courant. Les membres sont numérotés dans cet ordre —
 * le backend ne fournit pas les noms des membres avec les positions.
 */
export function positionsSuivies(
  group: Pick<Group, "locations" | "guideId">,
  userId: string | undefined,
): PositionSuivie[] {
  let numero = 0;
  return [...group.locations]
    .sort((a, b) => b.updatedAt.localeCompare(a.updatedAt))
    .map((p) => {
      if (p.userId === userId) return { ...p, role: "moi", numero: 0 };
      if (p.userId === group.guideId) return { ...p, role: "guide", numero: 0 };
      numero += 1;
      return { ...p, role: "membre", numero };
    });
}

const RAYON_TERRE_M = 6_371_000;
const radians = (degres: number) => (degres * Math.PI) / 180;

/** Distance à vol d'oiseau (haversine), en mètres. */
export function distanceMetres(
  a: { lat: number; lng: number },
  b: { lat: number; lng: number },
): number {
  const dLat = radians(b.lat - a.lat);
  const dLng = radians(b.lng - a.lng);
  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(radians(a.lat)) *
      Math.cos(radians(b.lat)) *
      Math.sin(dLng / 2) ** 2;
  return 2 * RAYON_TERRE_M * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Filtres de la liste (dans l'URL, règle 8). */
export const FILTRES_SUIVI = ["all", "live", "guide", "stale"] as const;
export type FiltreSuivi = (typeof FILTRES_SUIVI)[number];

export function lireFiltre(brut: string | null): FiltreSuivi {
  return FILTRES_SUIVI.find((f) => f === brut) ?? "all";
}

export function filtrer(
  positions: readonly PositionSuivie[],
  filtre: FiltreSuivi,
  maintenant: number,
): PositionSuivie[] {
  switch (filtre) {
    case "live":
      return positions.filter(
        (p) => fraicheur(p.updatedAt, maintenant) === "live",
      );
    case "guide":
      return positions.filter((p) => p.role === "guide");
    case "stale":
      return positions.filter(
        (p) => fraicheur(p.updatedAt, maintenant) === "stale",
      );
    default:
      return [...positions];
  }
}
