import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ArrowRight, Bell, Check } from "lucide-react";
import { cn } from "cn";
import { LienAction, ROUTES_ACCUEIL } from "./landing-links";

/**
 * Deux vitrines alternées : l'écran de l'agence et la préparation du
 * pèlerin, chacune avec une maquette fidèle à l'interface réelle
 * (statuts aux couleurs du registre, chiffres en IBM Plex Mono). Données
 * fictives, légendées comme telles.
 */

const POINTS = ["point1", "point2", "point3"] as const;

function Vitrine({
  espace,
  inverse = false,
  href,
  maquette,
}: Readonly<{
  espace: "agency" | "pilgrim";
  inverse?: boolean;
  href: string;
  maquette: ReactNode;
}>) {
  const t = useTranslations(`landing.showcase.${espace}`);
  const tVitrine = useTranslations("landing.showcase");
  return (
    <section
      aria-labelledby={`vitrine-${espace}`}
      className="grid items-center gap-12 lg:grid-cols-2 lg:gap-20"
    >
      <div className={cn("landing-reveal space-y-6", inverse && "lg:order-2")}>
        <p className="text-primary text-sm font-semibold tracking-wide uppercase">
          {t("eyebrow")}
        </p>
        <h2
          id={`vitrine-${espace}`}
          className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl"
        >
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-lg">{t("body")}</p>
        <ul className="space-y-3">
          {POINTS.map((cle) => (
            <li key={cle} className="flex items-start gap-3">
              <span className="bg-primary text-primary-foreground mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                <Check aria-hidden className="size-3" />
              </span>
              {t(cle)}
            </li>
          ))}
        </ul>
        <LienAction href={href} variante="primaire">
          {t("cta")}
          <ArrowRight aria-hidden className="size-4" />
        </LienAction>
      </div>
      <figure className="landing-reveal relative">
        <div
          aria-hidden
          className="bg-primary-subtle absolute -inset-3 -z-10 rounded-3xl sm:-inset-6 rotate-2"
        />
        {maquette}
        <figcaption className="text-muted-foreground mt-4 text-center text-xs">
          {tVitrine("caption")}
        </figcaption>
      </figure>
    </section>
  );
}

const STATS = [
  { libelle: "statBookings", valeur: "statBookingsValue" },
  { libelle: "statDocuments", valeur: "statDocumentsValue" },
  { libelle: "statPayments", valeur: "statPaymentsValue" },
] as const;

const LIGNES = [
  {
    nom: "row1Name",
    statut: "row1Status",
    ton: "bg-state-success-bg text-state-success",
  },
  {
    nom: "row2Name",
    statut: "row2Status",
    ton: "bg-state-progress-bg text-state-progress",
  },
  {
    nom: "row3Name",
    statut: "row3Status",
    ton: "bg-state-warning-bg text-state-warning",
  },
] as const;

function MaquetteAgence() {
  const t = useTranslations("landing.showcase.agency");
  return (
    <div
      aria-hidden
      className="bg-card shadow-float overflow-hidden rounded-xl border"
    >
      <div className="bg-sidebar flex items-center gap-2 border-b px-4 py-3">
        <span className="bg-state-danger size-2.5 rounded-full opacity-60" />
        <span className="bg-state-warning size-2.5 rounded-full opacity-60" />
        <span className="bg-state-success size-2.5 rounded-full opacity-60" />
        <div className="ml-3">
          <p className="text-sm font-semibold">{t("mockTitle")}</p>
          <p className="text-muted-foreground text-xs">{t("mockSubtitle")}</p>
        </div>
      </div>
      <div className="space-y-4 p-4">
        <div className="grid grid-cols-3 gap-3">
          {STATS.map(({ libelle, valeur }) => (
            <div key={libelle} className="bg-background rounded-lg border p-3">
              <p className="text-muted-foreground text-xs">{t(libelle)}</p>
              <p className="font-mono text-2xl font-semibold">{t(valeur)}</p>
            </div>
          ))}
        </div>
        <div className="overflow-hidden rounded-lg border">
          <div className="bg-muted text-muted-foreground grid grid-cols-2 px-3 py-2 text-xs font-medium">
            <span>{t("tablePilgrim")}</span>
            <span>{t("tableStatus")}</span>
          </div>
          {LIGNES.map(({ nom, statut, ton }) => (
            <div
              key={nom}
              className="grid grid-cols-2 items-center border-t px-3 py-2.5 text-sm"
            >
              <span>{t(nom)}</span>
              <span
                className={cn(
                  "w-fit rounded-full px-2 py-0.5 text-xs font-medium",
                  ton,
                )}
              >
                {t(statut)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const ELEMENTS = ["item1", "item2", "item3", "item4", "item5"] as const;
const COCHES = 3;

function MaquettePelerin() {
  const t = useTranslations("landing.showcase.pilgrim");
  return (
    <div
      aria-hidden
      className="bg-card shadow-float mx-auto max-w-md space-y-4 rounded-xl border p-5"
    >
      <div className="flex items-center justify-between">
        <p className="font-semibold">{t("mockTitle")}</p>
        <span className="bg-primary-subtle text-primary rounded-full px-2.5 py-0.5 font-mono text-xs font-medium">
          {t("mockProgress")}
        </span>
      </div>
      <div className="bg-muted h-1.5 overflow-hidden rounded-full">
        <div className="h-full w-3/5">
          <div className="bg-primary landing-reveal h-full origin-left rounded-full" />
        </div>
      </div>
      <ul className="space-y-2">
        {ELEMENTS.map((cle, index) => {
          const coche = index < COCHES;
          return (
            <li
              key={cle}
              className="bg-background flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm"
            >
              <span
                className={cn(
                  "inline-flex size-5 shrink-0 items-center justify-center rounded-md border",
                  coche && "bg-primary border-primary text-primary-foreground",
                )}
              >
                {coche && <Check className="size-3.5" />}
              </span>
              <span
                className={cn(coche && "text-muted-foreground line-through")}
              >
                {t(cle)}
              </span>
            </li>
          );
        })}
      </ul>
      <div className="bg-state-progress-bg text-state-progress flex items-center gap-2 rounded-lg px-3 py-2 text-sm">
        <Bell className="animate-landing-float size-4 shrink-0" />
        {t("reminder")}
      </div>
    </div>
  );
}

export function LandingShowcase() {
  return (
    <div className="space-y-28 lg:space-y-36">
      <Vitrine
        espace="agency"
        href={ROUTES_ACCUEIL.inscriptionAgence}
        maquette={<MaquetteAgence />}
      />
      <Vitrine
        espace="pilgrim"
        inverse
        href={ROUTES_ACCUEIL.pelerin}
        maquette={<MaquettePelerin />}
      />
    </div>
  );
}
