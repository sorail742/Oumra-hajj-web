import { useTranslations } from "next-intl";
import { LandingBento } from "./LandingBento";
import {
  LandingCta,
  LandingFaq,
  LandingFooter,
  LandingTrust,
} from "./LandingClosing";
import { LandingHero } from "./LandingHero";
import {
  LandingAudiences,
  LandingJourney,
  LandingMarquee,
} from "./LandingSections";

/**
 * Page d'accueil publique (ADR-0005) : présente la plateforme et oriente
 * vers l'un des deux parcours d'authentification (`docs/socle-frontend.md`
 * §5) — pèlerin/guide par OTP, agence/admin par email. Composant serveur,
 * aucun appel API, animations en CSS uniquement : la page s'affiche même si
 * le backend est indisponible et respecte `prefers-reduced-motion`.
 */
export function LandingPage() {
  const t = useTranslations("landing");

  return (
    <div className="flex min-h-svh flex-col">
      <a
        href="#contenu"
        className="bg-background focus:ring-ring sr-only z-50 rounded-md px-4 py-2 focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:ring-2"
      >
        {t("skip")}
      </a>

      <LandingHero />
      <LandingMarquee />

      <main id="contenu" className="flex-1">
        <div className="mx-auto max-w-6xl space-y-28 px-4 py-24 sm:px-6 lg:space-y-36 lg:py-32">
          <LandingAudiences />
          <LandingJourney />
          <LandingBento />
        </div>
        <LandingTrust />
        <div className="mx-auto max-w-6xl space-y-28 px-4 py-24 sm:px-6 lg:py-32">
          <LandingFaq />
          <LandingCta />
        </div>
      </main>

      <LandingFooter />
    </div>
  );
}
