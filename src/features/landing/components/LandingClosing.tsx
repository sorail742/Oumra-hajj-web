import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  Lock,
  MessageCircleQuestion,
  Plus,
  ReceiptText,
  ShieldCheck,
} from "lucide-react";
import { LienAction, ROUTES_ACCUEIL } from "./landing-links";
import { EnTeteSection } from "./LandingSections";
import { CielEtoile } from "@/components/shared/illustrations/CielEtoile";
import {
  Croissant,
  PavageKhatam,
  Rosace,
} from "@/components/shared/illustrations/Geometrie";
import { SilhouetteMecque } from "@/components/shared/illustrations/SilhouetteMecque";

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
      className="grid scroll-mt-8 gap-10 lg:grid-cols-[1fr_1.6fr] lg:gap-16"
    >
      <div className="space-y-6">
        <EnTeteSection
          id="accueil-questions"
          eyebrow={t("eyebrow")}
          title={t("title")}
        />
        <p className="landing-reveal text-muted-foreground flex gap-3">
          <MessageCircleQuestion
            aria-hidden
            className="text-primary mt-0.5 size-5 shrink-0"
          />
          {t("more")}
        </p>
      </div>
      <div className="space-y-3">
        {QUESTIONS.map((numero) => (
          <details
            key={numero}
            className="landing-reveal group bg-card rounded-xl border px-6 shadow-(--shadow-raised) open:shadow-(--shadow-overlay)"
          >
            <summary className="flex cursor-pointer list-none items-center justify-between gap-4 py-5 font-medium [&::-webkit-details-marker]:hidden">
              {t(`q${numero}`)}
              <span className="bg-primary-subtle text-primary inline-flex size-8 shrink-0 items-center justify-center rounded-full transition-transform duration-(--motion-base) group-open:rotate-45">
                <Plus aria-hidden className="size-4" />
              </span>
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
      className="landing-reveal relative isolate overflow-hidden rounded-2xl bg-[linear-gradient(135deg,var(--landing-night-deep),var(--landing-night)_60%,var(--landing-horizon))] px-6 pt-14 pb-40 sm:px-12 sm:pb-48"
    >
      <CielEtoile className="absolute inset-0 -z-10 size-full" />
      <Rosace className="animate-landing-spin-slow absolute -top-32 -right-32 -z-10 size-[28rem] opacity-20" />
      <SilhouetteMecque className="absolute inset-x-0 bottom-0 -z-10 h-32 w-full sm:h-40" />
      <div className="flex flex-col gap-8 md:flex-row md:items-center md:justify-between">
        <div className="max-w-xl space-y-3">
          <Croissant className="size-10" />
          <h2
            id="accueil-agences"
            className="text-landing-on-night text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
          >
            {t("title")}
          </h2>
          <p className="text-landing-on-night-muted text-lg">{t("body")}</p>
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

const ANCRES = [
  { href: "#fonctionnalites", cle: "features" },
  { href: "#parcours", cle: "journey" },
  { href: "#confiance", cle: "trust" },
  { href: "#questions", cle: "faq" },
] as const;

const ENGAGEMENTS = ["commitment1", "commitment2", "commitment3"] as const;

function ColonnePied({
  titre,
  children,
}: Readonly<{ titre: string; children: ReactNode }>) {
  return (
    <div className="space-y-4">
      <p className="text-landing-on-night text-sm font-semibold">{titre}</p>
      <ul className="space-y-2.5 text-sm">{children}</ul>
    </div>
  );
}

const lienPied = "hover:text-landing-on-night transition-colors";

export function LandingFooter() {
  const t = useTranslations("landing");
  return (
    <footer className="bg-landing-night-deep text-landing-on-night-muted relative isolate overflow-hidden">
      <PavageKhatam className="text-landing-gold landing-fade-bottom absolute inset-0 -z-10 size-full opacity-[0.04]" />
      <div className="mx-auto grid max-w-6xl gap-12 px-4 py-16 sm:grid-cols-2 sm:px-6 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr]">
        <div className="space-y-4">
          <p className="text-landing-on-night flex items-center gap-2 text-lg font-semibold">
            <Croissant className="size-6" />
            {t("brand")}
          </p>
          <p className="max-w-xs text-sm">{t("footer.tagline")}</p>
          <p className="max-w-xs text-sm">{t("footer.madeFor")}</p>
        </div>
        <ColonnePied titre={t("footer.platform")}>
          {ANCRES.map(({ href, cle }) => (
            <li key={href}>
              <a href={href} className={lienPied}>
                {t(`nav.${cle}`)}
              </a>
            </li>
          ))}
        </ColonnePied>
        <nav aria-label={t("footer.ariaLabel")}>
          <ColonnePied titre={t("footer.spaces")}>
            <li>
              <Link href={ROUTES_ACCUEIL.pelerin} className={lienPied}>
                {t("footer.pilgrim")}
              </Link>
            </li>
            <li>
              <Link href={ROUTES_ACCUEIL.agence} className={lienPied}>
                {t("footer.agency")}
              </Link>
            </li>
            <li>
              <Link
                href={ROUTES_ACCUEIL.inscriptionAgence}
                className={lienPied}
              >
                {t("footer.register")}
              </Link>
            </li>
          </ColonnePied>
        </nav>
        <ColonnePied titre={t("footer.commitments")}>
          {ENGAGEMENTS.map((cle) => (
            <li key={cle} className="flex gap-2">
              <ShieldCheck
                aria-hidden
                className="text-landing-gold mt-0.5 size-4 shrink-0"
              />
              {t(`footer.${cle}`)}
            </li>
          ))}
        </ColonnePied>
      </div>
      <div className="border-landing-glass-border border-t">
        <p className="mx-auto max-w-6xl px-4 py-6 text-xs sm:px-6">
          {t("footer.rights", { year: new Date().getFullYear() })}
        </p>
      </div>
    </footer>
  );
}
