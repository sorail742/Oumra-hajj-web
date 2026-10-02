import Link from "next/link";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  ChevronDown,
  Lock,
  ReceiptText,
} from "lucide-react";
import { LienAction, ROUTES_ACCUEIL } from "./landing-links";
import { EnTeteSection } from "./LandingSections";
import { Croissant, PavageKhatam, Rosace } from "./illustrations/Geometrie";

/**
 * Fin de page d'accueil : garanties (bandeau de nuit), questions
 * fréquentes (`<details>`, sans JavaScript), appel aux agences, pied de page.
 */

const GARANTIES: readonly {
  cle: "agencies" | "documents" | "payments" | "religious";
  icone: LucideIcon;
}[] = [
  { cle: "agencies", icone: BadgeCheck },
  { cle: "documents", icone: Lock },
  { cle: "payments", icone: ReceiptText },
  { cle: "religious", icone: BookOpen },
];

export function LandingTrust() {
  const t = useTranslations("landing.trust");
  return (
    <section
      id="confiance"
      aria-labelledby="accueil-confiance"
      className="bg-landing-night relative isolate scroll-mt-8 overflow-hidden"
    >
      <PavageKhatam className="text-landing-gold landing-fade-bottom absolute inset-0 -z-10 size-full opacity-[0.06]" />
      <Rosace className="animate-landing-spin-slow absolute -bottom-40 -left-40 -z-10 size-[32rem] opacity-10" />
      <div className="mx-auto grid max-w-6xl gap-14 px-4 py-24 sm:px-6 lg:grid-cols-[1fr_1.4fr] lg:py-32">
        <div className="landing-reveal space-y-4">
          <p className="text-landing-gold text-sm font-semibold tracking-wide uppercase">
            {t("eyebrow")}
          </p>
          <h2
            id="accueil-confiance"
            className="text-landing-on-night text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="text-landing-on-night-muted text-lg">{t("subtitle")}</p>
        </div>
        <ul className="grid gap-5 sm:grid-cols-2">
          {GARANTIES.map(({ cle, icone: Icone }) => (
            <li
              key={cle}
              className="landing-reveal border-landing-glass-border bg-landing-glass space-y-3 rounded-xl border p-6 backdrop-blur"
            >
              <Icone aria-hidden className="text-landing-gold size-6" />
              <h3 className="text-landing-on-night font-semibold">
                {t(`${cle}.title`)}
              </h3>
              <p className="text-landing-on-night-muted text-sm">
                {t(`${cle}.body`)}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

const QUESTIONS = ["1", "2", "3", "4", "5"] as const;

export function LandingFaq() {
  const t = useTranslations("landing.faq");
  return (
    <section
      id="questions"
      aria-labelledby="accueil-questions"
      className="mx-auto max-w-3xl scroll-mt-8 space-y-10"
    >
      <EnTeteSection
        id="accueil-questions"
        eyebrow={t("eyebrow")}
        title={t("title")}
        centre
      />
      <div className="divide-y rounded-xl border">
        {QUESTIONS.map((numero) => (
          <details key={numero} className="landing-reveal group px-6">
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden">
              {t(`q${numero}`)}
              <ChevronDown
                aria-hidden
                className="text-muted-foreground size-5 shrink-0 transition-transform duration-(--motion-base) group-open:rotate-180"
              />
            </summary>
            <p className="text-muted-foreground pb-5">{t(`a${numero}`)}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

export function LandingCta() {
  const t = useTranslations("landing.cta");
  return (
    <section
      aria-labelledby="accueil-agences"
      className="landing-reveal relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--landing-night-deep),var(--landing-night)_60%,var(--landing-horizon))] px-6 py-14 sm:px-12"
    >
      <Rosace className="animate-landing-spin-slow absolute -top-32 -right-32 -z-10 size-[28rem] opacity-20" />
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-3">
          <h2
            id="accueil-agences"
            className="text-landing-on-night text-3xl font-semibold tracking-tight text-balance"
          >
            {t("title")}
          </h2>
          <p className="text-landing-on-night-muted">{t("body")}</p>
        </div>
        <div className="flex shrink-0 flex-col gap-3 sm:flex-row">
          <LienAction href={ROUTES_ACCUEIL.inscriptionAgence} variante="or">
            {t("action")}
          </LienAction>
          <LienAction href={ROUTES_ACCUEIL.agence} variante="verre">
            {t("login")}
          </LienAction>
        </div>
      </div>
    </section>
  );
}

export function LandingFooter() {
  const t = useTranslations("landing");
  return (
    <footer className="border-t">
      <div className="text-muted-foreground mx-auto flex max-w-6xl flex-col gap-6 px-4 py-10 text-sm sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="space-y-1">
          <p className="text-foreground flex items-center gap-2 font-semibold">
            <Croissant className="size-5" />
            {t("brand")}
          </p>
          <p>{t("footer.tagline")}</p>
        </div>
        <nav
          aria-label={t("footer.ariaLabel")}
          className="flex flex-wrap gap-x-6 gap-y-2"
        >
          <Link href={ROUTES_ACCUEIL.pelerin} className="hover:text-foreground">
            {t("footer.pilgrim")}
          </Link>
          <Link href={ROUTES_ACCUEIL.agence} className="hover:text-foreground">
            {t("footer.agency")}
          </Link>
          <Link
            href={ROUTES_ACCUEIL.inscriptionAgence}
            className="hover:text-foreground"
          >
            {t("footer.register")}
          </Link>
        </nav>
      </div>
    </footer>
  );
}
