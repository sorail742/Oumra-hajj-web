import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Check,
  ClipboardList,
  CreditCard,
  FileCheck,
  Landmark,
  Plane,
  Search,
  UserRound,
} from "lucide-react";
import { cn } from "cn";

/**
 * Sections de contenu de la page d'accueil (ADR-0005) — composants serveur
 * sans état, animés en CSS au défilement (`landing-reveal`).
 */

export function EnTeteSection({
  id,
  eyebrow,
  title,
  subtitle,
  centre = false,
}: Readonly<{
  id: string;
  eyebrow: string;
  title: string;
  subtitle?: string;
  centre?: boolean;
}>) {
  return (
    <div
      className={cn(
        "landing-reveal max-w-2xl space-y-3",
        centre && "mx-auto text-center",
      )}
    >
      <p className="text-primary text-sm font-semibold tracking-wide uppercase">
        {eyebrow}
      </p>
      <h2
        id={id}
        className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
      >
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg text-pretty">{subtitle}</p>
      )}
    </div>
  );
}

const ELEMENTS_BANDEAU = [
  "item1",
  "item2",
  "item3",
  "item4",
  "item5",
  "item6",
  "item7",
  "item8",
] as const;

/** Bandeau défilant en boucle : la liste est rendue deux fois. */
export function LandingMarquee() {
  const t = useTranslations("landing.marquee");
  return (
    <section
      aria-label={t("ariaLabel")}
      className="bg-landing-silhouette text-landing-on-night-muted overflow-hidden py-5"
    >
      <div className="landing-marquee-mask">
        <ul className="animate-landing-marquee flex w-max gap-10 hover:[animation-play-state:paused]">
          {[0, 1].map((copie) =>
            ELEMENTS_BANDEAU.map((cle) => (
              <li
                key={`${String(copie)}-${cle}`}
                aria-hidden={copie === 1}
                className="flex items-center gap-10 text-sm font-medium whitespace-nowrap"
              >
                {t(cle)}
                <span aria-hidden className="text-landing-gold">
                  ✦
                </span>
              </li>
            )),
          )}
        </ul>
      </div>
    </section>
  );
}

const PROFILS: readonly {
  cle: "pilgrim" | "agency" | "admin";
  icone: LucideIcon;
}[] = [
  { cle: "pilgrim", icone: UserRound },
  { cle: "agency", icone: Building2 },
  { cle: "admin", icone: Landmark },
];

const PUCES = ["item1", "item2", "item3"] as const;

export function LandingAudiences() {
  const t = useTranslations("landing.audiences");
  return (
    <section aria-labelledby="accueil-profils" className="space-y-12">
      <EnTeteSection
        id="accueil-profils"
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <ul className="grid gap-6 md:grid-cols-3">
        {PROFILS.map(({ cle, icone: Icone }) => (
          <li
            key={cle}
            className="landing-reveal group bg-card relative overflow-hidden rounded-xl border p-7 shadow-(--shadow-raised) transition-all duration-(--motion-slow) hover:-translate-y-1 hover:shadow-(--shadow-overlay)"
          >
            <span
              aria-hidden
              className="bg-primary-subtle absolute -top-16 -right-16 size-40 rounded-full opacity-60 transition-transform duration-(--motion-slow) group-hover:scale-125"
            />
            <div className="relative space-y-5">
              <span className="bg-primary text-primary-foreground inline-flex size-12 items-center justify-center rounded-xl">
                <Icone aria-hidden className="size-6" />
              </span>
              <div className="space-y-2">
                <h3 className="text-xl font-semibold">{t(`${cle}.title`)}</h3>
                <p className="text-muted-foreground">{t(`${cle}.body`)}</p>
              </div>
              <ul className="space-y-2 text-sm">
                {PUCES.map((puce) => (
                  <li key={puce} className="flex gap-2">
                    <Check
                      aria-hidden
                      className="text-primary mt-0.5 size-4 shrink-0"
                    />
                    <span>{t(`${cle}.${puce}`)}</span>
                  </li>
                ))}
              </ul>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}

const ETAPES: readonly {
  cle: "step1" | "step2" | "step3" | "step4" | "step5";
  icone: LucideIcon;
}[] = [
  { cle: "step1", icone: Search },
  { cle: "step2", icone: CreditCard },
  { cle: "step3", icone: FileCheck },
  { cle: "step4", icone: ClipboardList },
  { cle: "step5", icone: Plane },
];

export function LandingJourney() {
  const t = useTranslations("landing.journey");
  return (
    <section
      id="parcours"
      aria-labelledby="accueil-parcours"
      className="scroll-mt-8 space-y-14"
    >
      <EnTeteSection
        id="accueil-parcours"
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
        centre
      />
      <div className="relative">
        {/* Fil du parcours, tracé au défilement. */}
        <svg
          aria-hidden
          viewBox="0 0 1000 4"
          preserveAspectRatio="none"
          className="absolute top-7 left-[10%] hidden h-1 w-4/5 lg:block"
        >
          <line
            x1={0}
            y1={2}
            x2={1000}
            y2={2}
            pathLength={1}
            className="landing-draw stroke-primary [stroke-width:4]"
          />
        </svg>
        <ol className="relative grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-6">
          {ETAPES.map(({ cle, icone: Icone }, index) => (
            <li
              key={cle}
              className="landing-reveal flex flex-col items-center space-y-4 text-center"
            >
              <span className="bg-background border-primary text-primary relative inline-flex size-14 items-center justify-center rounded-full border-2 shadow-(--shadow-raised)">
                <Icone aria-hidden className="size-6" />
                <span className="bg-primary text-primary-foreground absolute -top-1 -right-1 inline-flex size-5 items-center justify-center rounded-full font-mono text-xs">
                  {index + 1}
                </span>
              </span>
              <div className="space-y-1">
                <h3 className="font-semibold">{t(`${cle}.title`)}</h3>
                <p className="text-muted-foreground text-sm">
                  {t(`${cle}.body`)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
