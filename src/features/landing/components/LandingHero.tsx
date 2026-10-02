import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Check } from "lucide-react";
import { HeroMockup } from "./HeroMockup";
import { LienAction, ROUTES_ACCUEIL } from "./landing-links";
import { CielEtoile } from "./illustrations/CielEtoile";
import { Croissant, PavageKhatam, Rosace } from "./illustrations/Geometrie";
import { SilhouetteMecque } from "./illustrations/SilhouetteMecque";

/**
 * Bandeau d'accueil : ciel de nuit sur la Mecque, en-tête transparent,
 * accroche animée à l'entrée et aperçu de l'espace pèlerin. Composant
 * serveur ; toutes les animations sont en CSS (globals.css § 6).
 */

const ANCRES = [
  { href: "#fonctionnalites", cle: "features" },
  { href: "#parcours", cle: "journey" },
  { href: "#confiance", cle: "trust" },
  { href: "#questions", cle: "faq" },
] as const;

const REASSURANCES = ["reassurance1", "reassurance2", "reassurance3"] as const;

function EnTete() {
  const t = useTranslations("landing");
  return (
    <header className="relative z-20">
      <div className="mx-auto flex h-20 max-w-6xl items-center justify-between gap-6 px-4 sm:px-6">
        <Link
          href={ROUTES_ACCUEIL.accueil}
          className="text-landing-on-night flex items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Croissant className="size-6" />
          {t("brand")}
        </Link>
        <nav
          aria-label={t("nav.ariaLabel")}
          className="text-landing-on-night-muted flex items-center gap-1 text-sm"
        >
          {ANCRES.map(({ href, cle }) => (
            <a
              key={href}
              href={href}
              className="hover:text-landing-on-night hidden rounded-md px-3 py-2 transition-colors md:inline-flex"
            >
              {t(`nav.${cle}`)}
            </a>
          ))}
          <Link
            href={ROUTES_ACCUEIL.pelerin}
            className="hover:text-landing-on-night hidden rounded-md px-3 py-2 transition-colors sm:inline-flex"
          >
            {t("nav.pilgrim")}
          </Link>
          <Link
            href={ROUTES_ACCUEIL.agence}
            className="border-landing-glass-border bg-landing-glass text-landing-on-night hover:bg-landing-glass-border rounded-full border px-4 py-2 font-medium backdrop-blur transition-colors"
          >
            {t("nav.agency")}
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function LandingHero() {
  const t = useTranslations("landing.hero");

  return (
    <section
      aria-labelledby="accueil-titre"
      className="relative isolate overflow-hidden bg-[linear-gradient(180deg,var(--landing-night-deep)_0%,var(--landing-night)_55%,var(--landing-horizon)_100%)]"
    >
      {/* Décor : ciel, motif, lune, rosace, silhouette. */}
      <div aria-hidden className="absolute inset-0 -z-10">
        <CielEtoile className="absolute inset-0 size-full" />
        <PavageKhatam className="text-landing-gold absolute inset-0 size-full landing-fade-bottom opacity-[0.05]" />
        <Croissant className="animate-landing-fade-up landing-delay-3 absolute top-28 right-[8%] size-20 md:size-28" />
        <Rosace className="animate-landing-spin-slow absolute top-1/2 right-[-12rem] size-[44rem] -translate-y-1/2 opacity-15 lg:right-[2%]" />
        <SilhouetteMecque className="absolute inset-x-0 bottom-0 h-56 w-full sm:h-72 md:h-80" />
      </div>

      <EnTete />

      <div className="mx-auto grid max-w-6xl items-center gap-16 px-4 pt-10 pb-64 sm:px-6 sm:pb-80 lg:grid-cols-[1.1fr_1fr] lg:pt-16 lg:pb-96">
        <div className="space-y-8">
          <p className="animate-landing-fade-up border-landing-glass-border bg-landing-glass text-landing-on-night inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-medium tracking-wide backdrop-blur">
            <span className="bg-landing-gold size-1.5 rounded-full" />
            {t("eyebrow")}
          </p>

          <h1
            id="accueil-titre"
            className="text-landing-on-night text-4xl font-semibold tracking-tight text-balance sm:text-5xl lg:text-6xl"
          >
            <span className="animate-landing-fade-up landing-delay-1 block">
              {t("titleStart")}
            </span>
            <span className="animate-landing-fade-up landing-delay-2 text-landing-gold block">
              {t("titleAccent")}
            </span>
          </h1>

          <p className="animate-landing-fade-up landing-delay-3 text-landing-on-night-muted max-w-xl text-lg">
            {t("subtitle")}
          </p>

          <div className="animate-landing-fade-up landing-delay-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <LienAction href={ROUTES_ACCUEIL.pelerin} variante="or">
              {t("ctaPilgrim")}
              <ArrowRight aria-hidden className="size-4" />
            </LienAction>
            <LienAction href={ROUTES_ACCUEIL.agence} variante="verre">
              {t("ctaAgency")}
            </LienAction>
            <LienAction href={ROUTES_ACCUEIL.inscriptionAgence} variante="nuit">
              {t("registerAgency")}
            </LienAction>
          </div>

          <ul className="animate-landing-fade-up landing-delay-5 text-landing-on-night-muted flex flex-wrap gap-x-6 gap-y-2 text-sm">
            {REASSURANCES.map((cle) => (
              <li key={cle} className="flex items-center gap-2">
                <Check aria-hidden className="text-landing-gold size-4" />
                {t(cle)}
              </li>
            ))}
          </ul>
        </div>

        <div className="animate-landing-fade-up landing-delay-3">
          <HeroMockup />
        </div>
      </div>

      <p className="sr-only">{t("illustration")}</p>
    </section>
  );
}
