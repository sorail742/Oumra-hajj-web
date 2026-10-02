import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  BadgeCheck,
  BookOpen,
  Building2,
  Check,
  Landmark,
  Lock,
  ReceiptText,
  UserRound,
} from "lucide-react";

/**
 * Sections de contenu de la page d'accueil — composants serveur sans état.
 * `useTranslations` (et non `getTranslations`) pour rester testables sous
 * `NextIntlClientProvider`.
 */

const PUCES = ["item1", "item2", "item3", "item4"] as const;

const PROFILS: readonly {
  cle: "pilgrim" | "agency" | "admin";
  icone: LucideIcon;
}[] = [
  { cle: "pilgrim", icone: UserRound },
  { cle: "agency", icone: Building2 },
  { cle: "admin", icone: Landmark },
];

const ETAPES = ["step1", "step2", "step3", "step4"] as const;

const GARANTIES: readonly {
  cle: "agencies" | "documents" | "payments" | "religious";
  icone: LucideIcon;
}[] = [
  { cle: "agencies", icone: BadgeCheck },
  { cle: "documents", icone: Lock },
  { cle: "payments", icone: ReceiptText },
  { cle: "religious", icone: BookOpen },
];

function TitreSection({ id, children }: { id: string; children: string }) {
  return (
    <h2 id={id} className="text-2xl font-semibold tracking-tight">
      {children}
    </h2>
  );
}

export function LandingAudiences() {
  const t = useTranslations("landing.audiences");
  return (
    <section aria-labelledby="accueil-profils" className="space-y-8">
      <TitreSection id="accueil-profils">{t("title")}</TitreSection>
      <ul className="grid gap-4 md:grid-cols-3">
        {PROFILS.map(({ cle, icone: Icone }) => (
          <li
            key={cle}
            className="bg-card space-y-4 rounded-lg border p-6 shadow-(--shadow-raised)"
          >
            <div className="flex items-center gap-3">
              <span className="bg-primary-subtle text-primary inline-flex size-10 items-center justify-center rounded-md">
                <Icone aria-hidden className="size-5" />
              </span>
              <h3 className="font-semibold">{t(`${cle}.title`)}</h3>
            </div>
            <ul className="text-muted-foreground space-y-2 text-sm">
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
          </li>
        ))}
      </ul>
    </section>
  );
}

export function LandingSteps() {
  const t = useTranslations("landing.steps");
  return (
    <section aria-labelledby="accueil-etapes" className="space-y-8">
      <TitreSection id="accueil-etapes">{t("title")}</TitreSection>
      <ol className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {ETAPES.map((etape, index) => (
          <li key={etape} className="space-y-2">
            <span
              aria-hidden
              className="border-primary text-primary inline-flex size-8 items-center justify-center rounded-full border font-mono text-sm font-semibold"
            >
              {index + 1}
            </span>
            <h3 className="font-semibold">{t(`${etape}.title`)}</h3>
            <p className="text-muted-foreground text-sm">
              {t(`${etape}.body`)}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function LandingTrust() {
  const t = useTranslations("landing.trust");
  return (
    <section aria-labelledby="accueil-confiance" className="space-y-8">
      <TitreSection id="accueil-confiance">{t("title")}</TitreSection>
      <ul className="grid gap-x-8 gap-y-6 sm:grid-cols-2">
        {GARANTIES.map(({ cle, icone: Icone }) => (
          <li key={cle} className="flex gap-4">
            <Icone
              aria-hidden
              className="text-primary mt-0.5 size-5 shrink-0"
            />
            <div className="space-y-1">
              <h3 className="font-semibold">{t(`${cle}.title`)}</h3>
              <p className="text-muted-foreground text-sm">
                {t(`${cle}.body`)}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
