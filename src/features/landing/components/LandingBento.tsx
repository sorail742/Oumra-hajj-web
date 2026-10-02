import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  FileCheck,
  HandCoins,
  Link2,
  MessagesSquare,
  ReceiptText,
} from "lucide-react";
import { cn } from "cn";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
import { EnTeteSection } from "./LandingSections";

/**
 * Grille « bento » des fonctionnalités : chaque carte montre une vignette de
 * l'interface réelle (reçu, documents, messagerie…) plutôt qu'une icône
 * générique. Données fictives, aucune pièce d'identité ni paiement réel.
 */

function Carte({
  titre,
  texte,
  icone: Icone,
  className,
  children,
}: Readonly<{
  titre: string;
  texte: string;
  icone: LucideIcon;
  className?: string;
  children?: ReactNode;
}>) {
  return (
    <li
      className={cn(
        "landing-reveal group bg-card flex flex-col gap-6 overflow-hidden rounded-xl border p-6 shadow-(--shadow-raised) transition-shadow duration-(--motion-slow) hover:shadow-(--shadow-overlay)",
        className,
      )}
    >
      <div className="space-y-2">
        <span className="bg-primary-subtle text-primary inline-flex size-10 items-center justify-center rounded-lg">
          <Icone aria-hidden className="size-5" />
        </span>
        <h3 className="text-lg font-semibold">{titre}</h3>
        <p className="text-muted-foreground text-sm">{texte}</p>
      </div>
      {children && <div className="mt-auto">{children}</div>}
    </li>
  );
}

function Recu() {
  const t = useTranslations("landing.bento.payments");
  const lignes = [
    ["receiptAmountLabel", "receiptAmount"],
    ["receiptMethodLabel", "receiptMethod"],
    ["receiptRefLabel", "receiptRef"],
  ] as const;
  return (
    <div
      aria-hidden
      className="bg-background rounded-lg border border-dashed p-4 transition-transform duration-(--motion-slow) group-hover:-rotate-1"
    >
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold">{t("receiptTitle")}</span>
        <span className="bg-state-success-bg text-state-success rounded-full px-2 py-0.5 text-xs font-medium">
          {t("receiptStatus")}
        </span>
      </div>
      <dl className="space-y-1.5 text-sm">
        {lignes.map(([libelle, valeur]) => (
          <div key={libelle} className="flex justify-between gap-4">
            <dt className="text-muted-foreground">{t(libelle)}</dt>
            <dd className="font-mono">{t(valeur)}</dd>
          </div>
        ))}
      </dl>
    </div>
  );
}

function ListeDocuments() {
  const t = useTranslations("landing.bento.documents");
  const documents = [
    { cle: "passport", valide: true },
    { cle: "visa", valide: true },
    { cle: "vaccine", valide: false },
  ] as const;
  return (
    <ul aria-hidden className="space-y-2">
      {documents.map(({ cle, valide }) => (
        <li
          key={cle}
          className="bg-background flex items-center justify-between rounded-lg border px-3 py-2 text-sm"
        >
          <span>{t(cle)}</span>
          <span
            className={cn(
              "rounded-full px-2 py-0.5 text-xs font-medium",
              valide
                ? "bg-state-success-bg text-state-success"
                : "bg-state-progress-bg text-state-progress",
            )}
          >
            {t(valide ? "validated" : "pending")}
          </span>
        </li>
      ))}
    </ul>
  );
}

function Bulle() {
  const t = useTranslations("landing.bento.groups");
  return (
    <div aria-hidden className="space-y-2">
      <div className="bg-muted w-4/5 rounded-2xl rounded-bl-sm px-3 py-2 text-sm">
        {t("message")}
      </div>
      <div className="flex gap-1 pl-1">
        <span className="bg-muted-foreground/50 animate-landing-twinkle size-1.5 rounded-full" />
        <span className="bg-muted-foreground/50 animate-landing-twinkle landing-delay-1 size-1.5 rounded-full" />
        <span className="bg-muted-foreground/50 animate-landing-twinkle landing-delay-2 size-1.5 rounded-full" />
      </div>
    </div>
  );
}

/** Mini-histogramme d'épargne qui monte au défilement. */
function Histogramme() {
  const barres = ["h-1/4", "h-2/5", "h-1/2", "h-3/5", "h-4/5", "h-full"];
  return (
    <div aria-hidden className="flex h-20 items-end gap-2">
      {barres.map((hauteur) => (
        <span
          key={hauteur}
          className={cn(
            "landing-reveal bg-chart-1 w-full origin-bottom rounded-t-sm opacity-80",
            hauteur,
          )}
        />
      ))}
    </div>
  );
}

export function LandingBento() {
  const t = useTranslations("landing.bento");
  return (
    <section
      id="fonctionnalites"
      aria-labelledby="accueil-fonctionnalites"
      className="scroll-mt-8 space-y-12"
    >
      <EnTeteSection
        id="accueil-fonctionnalites"
        eyebrow={t("eyebrow")}
        title={t("title")}
        subtitle={t("subtitle")}
      />
      <ul className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Carte
          titre={t("payments.title")}
          texte={t("payments.body")}
          icone={ReceiptText}
          className="lg:col-span-2"
        >
          <Recu />
        </Carte>
        <Carte
          titre={t("documents.title")}
          texte={t("documents.body")}
          icone={FileCheck}
          className="lg:row-span-2"
        >
          <ListeDocuments />
        </Carte>
        <Carte
          titre={t("groups.title")}
          texte={t("groups.body")}
          icone={MessagesSquare}
        >
          <Bulle />
        </Carte>
        <Carte
          titre={t("budget.title")}
          texte={t("budget.body")}
          icone={HandCoins}
        >
          <Histogramme />
        </Carte>
        <Carte
          titre={t("family.title")}
          texte={t("family.body")}
          icone={Link2}
        />
        <Carte
          titre={t("rites.title")}
          texte={t("rites.body")}
          icone={BookOpen}
          className="lg:col-span-2"
        >
          <ReligiousContentNotice validated={false} />
        </Carte>
      </ul>
    </section>
  );
}
