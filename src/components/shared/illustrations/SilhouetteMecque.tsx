import { useId } from "react";
import { cn } from "cn";

/**
 * Silhouette de la Mecque à la tombée de la nuit, dessinée pour la page
 * d'accueil (ADR-0005) : tour de l'horloge, minarets, arcades éclairées et
 * Kaaba ceinte de sa bande dorée. Formes géométriques simples, aucune
 * figure humaine ; couleurs exclusivement issues des tokens `landing-*`.
 */

const VIEWBOX_LARGEUR = 1440;
const SOL = 340;

interface Minaret {
  x: number;
  hauteur: number;
}

const MINARETS: readonly Minaret[] = [
  { x: 250, hauteur: 190 },
  { x: 330, hauteur: 160 },
  { x: 470, hauteur: 205 },
  { x: 1090, hauteur: 200 },
  { x: 1180, hauteur: 165 },
  { x: 1300, hauteur: 185 },
];

/** Fenêtres en arc des arcades, de part et d'autre de la Kaaba. */
const FENETRES: readonly number[] = Array.from(
  { length: 30 },
  (_, index) => 180 + index * 38,
).filter((x) => x < 548 || x > 720);

function MinaretForme({ x, hauteur }: Minaret) {
  const haut = SOL - hauteur;
  return (
    <g>
      <rect x={x - 5} y={haut + 18} width={10} height={hauteur - 18} />
      <rect x={x - 9} y={haut + 48} width={18} height={5} />
      <rect x={x - 8} y={haut + 92} width={16} height={4} />
      <polygon
        points={`${x - 6},${haut + 20} ${x + 6},${haut + 20} ${x},${haut}`}
      />
      <rect x={x - 0.75} y={haut - 10} width={1.5} height={12} />
    </g>
  );
}

export function SilhouetteMecque({
  className,
}: Readonly<{ className?: string }>) {
  const halo = useId();

  return (
    <svg
      aria-hidden
      viewBox={`0 -40 ${VIEWBOX_LARGEUR} 420`}
      preserveAspectRatio="xMidYMax slice"
      className={cn("pointer-events-none", className)}
    >
      <defs>
        <radialGradient id={halo} cx="50%" cy="100%" r="60%">
          <stop
            offset="0%"
            className="[stop-color:var(--landing-gold)] [stop-opacity:0.35]"
          />
          <stop
            offset="100%"
            className="[stop-color:var(--landing-gold)] [stop-opacity:0]"
          />
        </radialGradient>
      </defs>

      {/* Lueur dorée qui monte de l'enceinte. */}
      <ellipse
        cx={640}
        cy={SOL}
        rx={520}
        ry={170}
        fill={`url(#${halo})`}
        className="animate-landing-glow"
      />

      {/* Montagnes lointaines. */}
      <polygon
        className="fill-landing-night-deep opacity-80"
        points={`0,${SOL} 0,250 140,205 260,240 400,180 560,235 700,200 860,240 1010,190 1160,230 1300,195 1440,225 1440,${SOL}`}
      />

      <g className="fill-landing-silhouette">
        {/* Tour de l'horloge. */}
        <rect x={790} y={250} width={220} height={SOL - 250} />
        <rect x={840} y={150} width={120} height={110} />
        <rect x={865} y={70} width={70} height={90} />
        <rect x={878} y={30} width={44} height={45} />
        <polygon points="884,32 916,32 903,-4 897,-4" />
        <rect x={899} y={-30} width={2} height={28} />

        {MINARETS.map((minaret) => (
          <MinaretForme key={minaret.x} {...minaret} />
        ))}

        {/* Arcades de l'enceinte et coupoles. */}
        <rect x={150} y={282} width={420} height={SOL - 282} />
        <rect x={710} y={282} width={620} height={SOL - 282} />
        {/* Cour intérieure, plus basse, autour de la Kaaba. */}
        <rect x={570} y={318} width={140} height={SOL - 318} />
        <path d="M 380 282 a 34 34 0 0 1 68 0 z" />
        <path d="M 1010 282 a 30 30 0 0 1 60 0 z" />
        <path d="M 1200 282 a 26 26 0 0 1 52 0 z" />
      </g>

      {/* Cadran de l'horloge, éclairé. */}
      <circle
        cx={900}
        cy={52}
        r={13}
        className="fill-landing-gold animate-landing-glow"
      />

      {/* Fenêtres éclairées des arcades. */}
      <g className="fill-landing-gold opacity-60">
        {FENETRES.map((x) => (
          <rect key={x} x={x} y={298} width={12} height={20} rx={6} />
        ))}
      </g>

      {/* Kaaba et sa bande dorée, au centre de l'enceinte. */}
      <rect
        x={606}
        y={268}
        width={68}
        height={SOL - 268}
        className="fill-landing-silhouette"
      />
      <rect
        x={606}
        y={281}
        width={68}
        height={6}
        className="fill-landing-gold"
      />

      {/* Sol. */}
      <rect
        x={0}
        y={SOL}
        width={VIEWBOX_LARGEUR}
        height={40}
        className="fill-landing-silhouette"
      />
    </svg>
  );
}
