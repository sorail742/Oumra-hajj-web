import type { Fraicheur, RolePosition } from "../../lib/suivi";

/**
 * Habillage de la carte de suivi (ADR-0007). Les styles de fond viennent
 * de variables publiques — changer de fournisseur de tuiles ne demande pas
 * de toucher au code. Par défaut : OpenFreeMap (données OpenStreetMap,
 * sans clé ni compte).
 */
export const STYLES_CARTE = {
  light:
    process.env["NEXT_PUBLIC_MAP_STYLE_LIGHT"] ||
    "https://tiles.openfreemap.org/styles/positron",
  dark:
    process.env["NEXT_PUBLIC_MAP_STYLE_DARK"] ||
    "https://tiles.openfreemap.org/styles/dark",
} as const;

/**
 * Classes d'un repère — uniquement des tokens (règle 1). Point plein
 * coloré selon le rôle, halo pulsé si la position est en direct, étiquette
 * visible quand le repère est sélectionné (comme une bulle de suivi).
 */
const POINT_PAR_ROLE: Record<RolePosition, string> = {
  guide: "bg-primary",
  moi: "bg-state-progress",
  membre: "bg-foreground",
};

export function classesRepere(
  role: RolePosition,
  fraicheur: Fraicheur,
  choisi: boolean,
) {
  return {
    bouton:
      "group flex cursor-pointer flex-col items-center gap-1 outline-none focus-visible:[&>span:last-child]:outline-2 focus-visible:[&>span:last-child]:outline-ring",
    etiquette: [
      "rounded-md border bg-popover px-2 py-0.5 text-xs font-medium whitespace-nowrap text-popover-foreground shadow-(--shadow-overlay)",
      choisi ? "block" : "hidden group-hover:block",
    ].join(" "),
    point: [
      "block rounded-full border-2 border-card shadow-(--shadow-overlay) transition-transform duration-(--motion-fast)",
      POINT_PAR_ROLE[role],
      choisi ? "size-5 ring-4 ring-primary/35" : "size-4",
      fraicheur === "live" ? "animate-landing-pulse" : "",
      fraicheur === "stale" ? "opacity-55" : "",
    ].join(" "),
  };
}

/**
 * Couleur d'un token CSS pour MapLibre, qui ne lit pas `oklch()` : le
 * navigateur peint un pixel avec le token et on relit son RGB. Lu au
 * moment de tracer, donc à jour après un changement de thème.
 */
export function couleurDuToken(token: `--${string}`): string | undefined {
  const valeur = getComputedStyle(document.documentElement)
    .getPropertyValue(token)
    .trim();
  const toile = document.createElement("canvas");
  toile.width = 1;
  toile.height = 1;
  const contexte = toile.getContext("2d", { willReadFrequently: true });
  if (!contexte || !valeur) return undefined;
  contexte.fillStyle = valeur;
  contexte.fillRect(0, 0, 1, 1);
  const [r = 0, g = 0, b = 0] = contexte.getImageData(0, 0, 1, 1).data;
  return `rgb(${r}, ${g}, ${b})`;
}
