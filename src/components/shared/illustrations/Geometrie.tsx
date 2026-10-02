import { useId } from "react";
import { cn } from "cn";

/**
 * Géométrie islamique dessinée pour la page d'accueil (ADR-0005) :
 * une rosace à seize branches et un pavage d'étoiles à huit branches
 * (khatam), tracés au trait doré. Purement décoratif — `aria-hidden`.
 */

/** Points d'une étoile régulière à `branches` branches, centrée en 0,0. */
function etoile(
  branches: number,
  rayonExterieur: number,
  rayonInterieur: number,
) {
  const points: string[] = [];
  for (let i = 0; i < branches * 2; i += 1) {
    const rayon = i % 2 === 0 ? rayonExterieur : rayonInterieur;
    const angle = (Math.PI * i) / branches - Math.PI / 2;
    points.push(
      `${(Math.cos(angle) * rayon).toFixed(2)},${(Math.sin(angle) * rayon).toFixed(2)}`,
    );
  }
  return points.join(" ");
}

const ROSACE_EXTERIEURE = etoile(16, 200, 150);
const ROSACE_MEDIANE = etoile(16, 150, 112);
const ROSACE_INTERIEURE = etoile(8, 100, 62);
const KHATAM = etoile(8, 18, 11);

/** Rosace qui tourne très lentement — trois étoiles concentriques. */
export function Rosace({ className }: Readonly<{ className?: string }>) {
  return (
    <svg
      aria-hidden
      viewBox="-210 -210 420 420"
      className={cn("pointer-events-none", className)}
    >
      <g className="stroke-landing-gold fill-none [stroke-width:1]">
        <polygon points={ROSACE_EXTERIEURE} />
        <polygon points={ROSACE_MEDIANE} className="opacity-70" />
        <polygon points={ROSACE_INTERIEURE} className="opacity-60" />
        <circle r={205} className="opacity-30" />
        <circle r={56} className="opacity-50" />
      </g>
    </svg>
  );
}

/** Pavage d'étoiles à huit branches, à poser en fond d'une section. */
export function PavageKhatam({ className }: Readonly<{ className?: string }>) {
  const motif = useId();
  return (
    <svg aria-hidden className={cn("pointer-events-none", className)}>
      <defs>
        <pattern
          id={motif}
          width={48}
          height={48}
          patternUnits="userSpaceOnUse"
        >
          <polygon
            points={KHATAM}
            transform="translate(24 24)"
            className="stroke-current fill-none [stroke-width:0.75]"
          />
          <circle cx={0} cy={0} r={2} className="fill-current" />
          <circle cx={48} cy={0} r={2} className="fill-current" />
          <circle cx={0} cy={48} r={2} className="fill-current" />
          <circle cx={48} cy={48} r={2} className="fill-current" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill={`url(#${motif})`} />
    </svg>
  );
}

/** Croissant de lune doré, avec un léger halo. */
export function Croissant({ className }: Readonly<{ className?: string }>) {
  const masque = useId();
  return (
    <svg
      aria-hidden
      viewBox="0 0 100 100"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        <mask id={masque}>
          <rect width={100} height={100} className="fill-landing-star" />
          <circle cx={62} cy={42} r={34} className="fill-landing-silhouette" />
        </mask>
      </defs>
      <circle
        cx={50}
        cy={50}
        r={40}
        className="fill-landing-gold opacity-20 blur-md"
      />
      <circle
        cx={50}
        cy={50}
        r={36}
        mask={`url(#${masque})`}
        className="fill-landing-gold"
      />
    </svg>
  );
}
