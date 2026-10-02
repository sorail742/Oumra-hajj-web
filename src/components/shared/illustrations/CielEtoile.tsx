import { cn } from "cn";

/**
 * Ciel étoilé en SVG : positions déterministes (générateur pseudo-aléatoire
 * à graine fixe) pour un rendu serveur identique d'une requête à l'autre —
 * aucun risque d'écart d'hydratation, aucun JavaScript côté client.
 */

const NOMBRE_ETOILES = 90;
const DELAIS = [
  "landing-delay-1",
  "landing-delay-2",
  "landing-delay-3",
  "landing-delay-4",
  "landing-delay-5",
] as const;

/** Générateur congruentiel linéaire (Numerical Recipes) — reproductible. */
function generateur(graine: number) {
  let etat = graine;
  return () => {
    etat = (etat * 1664525 + 1013904223) % 4294967296;
    return etat / 4294967296;
  };
}

interface Etoile {
  id: string;
  x: number;
  y: number;
  r: number;
  delai: (typeof DELAIS)[number];
}

/** Quelques étoiles brillantes, beaucoup de discrètes. */
function rayon(tirage: number): number {
  if (tirage > 0.92) return 1.8;
  if (tirage > 0.6) return 1.1;
  return 0.7;
}

function etoiles(): Etoile[] {
  const hasard = generateur(1447);
  return Array.from({ length: NOMBRE_ETOILES }, (_, index) => ({
    id: `etoile-${String(index)}`,
    x: Math.round(hasard() * 1440),
    // Plus dense en haut du ciel, plus rare près de l'horizon.
    y: Math.round(hasard() ** 1.6 * 560),
    r: rayon(hasard()),
    delai: DELAIS[index % DELAIS.length] ?? "landing-delay-1",
  }));
}

const ETOILES = etoiles();

export function CielEtoile({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden
      viewBox="0 0 1440 640"
      preserveAspectRatio="xMidYMid slice"
      className={cn("pointer-events-none", className)}
    >
      {ETOILES.map((etoile) => (
        <circle
          key={etoile.id}
          cx={etoile.x}
          cy={etoile.y}
          r={etoile.r}
          className={cn(
            "fill-landing-star animate-landing-twinkle",
            etoile.delai,
          )}
        />
      ))}
    </svg>
  );
}
