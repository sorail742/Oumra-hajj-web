import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { LienAction, ROUTES_ACCUEIL } from "./landing-links";
import {
  LandingAudiences,
  LandingSteps,
  LandingTrust,
} from "./LandingSections";

/**
 * Page d'accueil publique : présente la plateforme et oriente vers l'un
 * des deux parcours d'authentification (`docs/socle-frontend.md` §5) —
 * pèlerin/guide par OTP, agence/admin par email. Aucun appel API : la page
 * reste servie statiquement et ne dépend pas de la disponibilité du backend.
 */
export function LandingPage() {
  const t = useTranslations("landing");

  return (
    <div className="flex min-h-svh flex-col">
      <header className="border-b">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
          <Link href="/" className="text-lg font-semibold tracking-tight">
            {t("brand")}
          </Link>
          <nav aria-label={t("nav.ariaLabel")} className="flex gap-1 text-sm">
            <Link
              href={ROUTES_ACCUEIL.pelerin}
              className="hover:bg-muted hidden rounded-md px-3 py-2 sm:inline-flex"
            >
              {t("nav.pilgrim")}
            </Link>
            <Link
              href={ROUTES_ACCUEIL.agence}
              className="text-primary hover:bg-primary-subtle rounded-md px-3 py-2 font-medium"
            >
              {t("nav.agency")}
            </Link>
          </nav>
        </div>
      </header>

      <main className="flex-1">
        <section className="bg-primary-subtle/40 border-b">
          <div className="mx-auto max-w-6xl space-y-6 px-4 py-16 sm:px-6 md:py-24">
            <p className="text-primary text-sm font-medium">
              {t("hero.eyebrow")}
            </p>
            <h1 className="max-w-3xl text-3xl font-semibold tracking-tight text-balance sm:text-4xl md:text-5xl">
              {t("hero.title")}
            </h1>
            <p className="text-muted-foreground max-w-(--content-prose) text-lg">
              {t("hero.subtitle")}
            </p>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <LienAction href={ROUTES_ACCUEIL.pelerin} variante="primaire">
                {t("hero.ctaPilgrim")}
                <ArrowRight aria-hidden className="size-4" />
              </LienAction>
              <LienAction href={ROUTES_ACCUEIL.agence} variante="secondaire">
                {t("hero.ctaAgency")}
              </LienAction>
              <LienAction
                href={ROUTES_ACCUEIL.inscriptionAgence}
                variante="discret"
              >
                {t("hero.registerAgency")}
              </LienAction>
            </div>
          </div>
        </section>

        <div className="mx-auto max-w-6xl space-y-20 px-4 py-16 sm:px-6 md:py-24">
          <LandingAudiences />
          <LandingSteps />
          <LandingTrust />

          <section
            aria-labelledby="accueil-agences"
            className="bg-card flex flex-col gap-6 rounded-lg border p-8 shadow-(--shadow-raised) md:flex-row md:items-center md:justify-between"
          >
            <div className="space-y-2">
              <h2
                id="accueil-agences"
                className="text-xl font-semibold tracking-tight text-balance"
              >
                {t("cta.title")}
              </h2>
              <p className="text-muted-foreground text-sm">{t("cta.body")}</p>
            </div>
            <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
              <LienAction
                href={ROUTES_ACCUEIL.inscriptionAgence}
                variante="primaire"
              >
                {t("cta.action")}
              </LienAction>
              <LienAction href={ROUTES_ACCUEIL.agence} variante="secondaire">
                {t("cta.login")}
              </LienAction>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t">
        <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-4 px-4 py-8 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="text-foreground font-semibold">{t("brand")}</p>
            <p>{t("footer.tagline")}</p>
          </div>
          <nav aria-label={t("footer.ariaLabel")} className="flex gap-4">
            <Link
              href={ROUTES_ACCUEIL.pelerin}
              className="hover:text-foreground"
            >
              {t("footer.pilgrim")}
            </Link>
            <Link
              href={ROUTES_ACCUEIL.agence}
              className="hover:text-foreground"
            >
              {t("footer.agency")}
            </Link>
          </nav>
        </div>
      </footer>
    </div>
  );
}
