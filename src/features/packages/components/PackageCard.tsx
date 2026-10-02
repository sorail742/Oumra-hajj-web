"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, CalendarDays, MapPin } from "lucide-react";
import { cn } from "cn";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import type { Package } from "../api/schemas";
import { dureeJours, placesRestantes, tauxRemplissage } from "../lib/forfait";

/** Seuil à partir duquel la jauge de places passe en ton d'attention. */
const SEUIL_PRESQUE_COMPLET = 0.8;

/**
 * Carte de forfait du catalogue : type, dates et durée, villes de
 * l'itinéraire, prix en GNF (Plex Mono), jauge de places restantes.
 * Toute la carte mène au détail du forfait.
 */
export function PackageCard({ forfait }: Readonly<{ forfait: Package }>) {
  const t = useTranslations("packages");
  const restantes = placesRestantes(forfait);
  const taux = tauxRemplissage(forfait);
  const villes = forfait.stages.map((etape) => etape.city).join(" → ");

  return (
    <Link
      href={`/packages/${forfait.id}`}
      className="group bg-card focus-visible:ring-ring/50 flex flex-col rounded-xl border p-5 shadow-(--shadow-raised) transition-all duration-(--motion-base) outline-none hover:-translate-y-0.5 hover:shadow-(--shadow-overlay) focus-visible:ring-[3px]"
    >
      <div className="flex items-start justify-between gap-3">
        <span
          className={cn(
            "rounded-full px-2.5 py-0.5 text-xs font-semibold",
            forfait.type === "hadj"
              ? "bg-state-progress-bg text-state-progress"
              : "bg-primary-subtle text-primary",
          )}
        >
          {t(forfait.type === "hadj" ? "typeHadj" : "typeOumra")}
        </span>
        <StatusBadge kind="package" value={forfait.status} />
      </div>

      <h3 className="mt-4 text-lg font-semibold text-balance">
        {forfait.title}
      </h3>

      <div className="text-muted-foreground mt-3 space-y-1.5 text-sm">
        <p className="flex items-center gap-2">
          <CalendarDays aria-hidden className="size-4 shrink-0" />
          {t("from", { date: formatDate(forfait.startDate) })} ·{" "}
          {t("duration", { days: dureeJours(forfait) })}
        </p>
        {villes && (
          <p className="flex items-center gap-2">
            <MapPin aria-hidden className="size-4 shrink-0" />
            <span className="truncate">{villes}</span>
          </p>
        )}
      </div>

      <div className="mt-auto space-y-1.5 pt-5">
        <div className="flex items-center justify-between text-xs">
          <span
            className={cn(
              "font-medium",
              taux >= SEUIL_PRESQUE_COMPLET
                ? "text-state-warning"
                : "text-muted-foreground",
            )}
          >
            {t("seatsLeft", { count: restantes })}
          </span>
        </div>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full",
              taux >= SEUIL_PRESQUE_COMPLET ? "bg-state-warning" : "bg-primary",
            )}
            style={{ width: `${Math.round(taux * 100)}%` }}
          />
        </div>
      </div>

      <div className="mt-4 flex items-end justify-between gap-3 border-t pt-4">
        <div>
          <p className="text-xl font-semibold">
            <Money montant={forfait.price} />
          </p>
          <p className="text-muted-foreground text-xs">{t("perPerson")}</p>
        </div>
        <span className="text-primary inline-flex items-center gap-1 text-sm font-medium">
          {t("viewDetail")}
          <ArrowRight
            aria-hidden
            className="size-4 transition-transform duration-(--motion-base) group-hover:translate-x-0.5"
          />
        </span>
      </div>
    </Link>
  );
}
