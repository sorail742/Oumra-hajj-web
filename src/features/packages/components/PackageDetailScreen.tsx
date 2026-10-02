"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import {
  ArrowLeft,
  Building2,
  CalendarDays,
  Check,
  Hotel,
  MapPin,
} from "lucide-react";
import { cn } from "cn";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types";
import { formatDate, formatNombre } from "@/lib/format";
import { usePackage } from "../api/use-packages";
import type { Package } from "../api/schemas";
import { dureeJours, placesRestantes, tauxRemplissage } from "../lib/forfait";

/**
 * Détail d'un forfait (ticket #32) — page de décision du pèlerin.
 * L'action de réservation est fournie par la page (`reserver`), qui la
 * compose depuis `features/bookings` : un `features/*` n'importe jamais un
 * autre (`CLAUDE.md` règle 2).
 */

function Squelette() {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-4">
        <Skeleton className="h-10 w-2/3" />
        <Skeleton className="h-5 w-1/3" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
      <Skeleton className="h-72 rounded-xl" />
    </div>
  );
}

function Itineraire({ forfait }: Readonly<{ forfait: Package }>) {
  const t = useTranslations("packages.detail");
  if (forfait.stages.length === 0) {
    return (
      <p className="text-muted-foreground text-sm">{t("itineraryEmpty")}</p>
    );
  }
  return (
    <ol className="relative space-y-6 border-l-2 border-dashed pl-6">
      {forfait.stages.map((etape) => (
        <li key={etape.id} className="relative">
          <span className="bg-primary text-primary-foreground absolute top-0 -left-[2.1rem] inline-flex size-6 items-center justify-center rounded-full">
            <MapPin aria-hidden className="size-3.5" />
          </span>
          <div className="bg-card space-y-2 rounded-xl border p-4 shadow-(--shadow-raised)">
            <p className="text-lg font-semibold">{etape.city}</p>
            <p className="text-muted-foreground flex items-center gap-2 text-sm">
              <CalendarDays aria-hidden className="size-4 shrink-0" />
              {t("stageDates", {
                start: formatDate(etape.startDate),
                end: formatDate(etape.endDate),
              })}
            </p>
            <p className="flex items-center gap-2 text-sm">
              <Hotel aria-hidden className="text-primary size-4 shrink-0" />
              <span className="text-muted-foreground">{t("hotel")} :</span>
              <span className="font-medium">{etape.hotelName}</span>
            </p>
            {etape.distanceToMosqueMeters !== undefined && (
              <p className="bg-primary-subtle text-primary inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                {t("distance", { meters: etape.distanceToMosqueMeters })}
              </p>
            )}
          </div>
        </li>
      ))}
    </ol>
  );
}

function CarteReservation({
  forfait,
  reserver,
}: Readonly<{ forfait: Package; reserver: ReactNode }>) {
  const t = useTranslations("packages");
  const restantes = placesRestantes(forfait);
  const taux = tauxRemplissage(forfait);
  return (
    <aside className="bg-card h-fit space-y-5 rounded-xl border p-6 shadow-(--shadow-overlay) lg:sticky lg:top-6">
      <div>
        <p className="text-muted-foreground text-sm">{t("detail.price")}</p>
        <p className="text-3xl font-semibold">
          <Money montant={forfait.price} />
        </p>
        <p className="text-muted-foreground text-sm">{t("perPerson")}</p>
      </div>
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-muted-foreground">
            {t("detail.availability")}
          </span>
          <StatusBadge kind="package" value={forfait.status} />
        </div>
        <div className="bg-muted h-2 overflow-hidden rounded-full">
          <div
            className={cn(
              "h-full rounded-full",
              taux >= 0.8 ? "bg-state-warning" : "bg-primary",
            )}
            style={{ width: `${Math.round(taux * 100)}%` }}
          />
        </div>
        <p className="text-sm font-medium">
          {t("seatsLeft", { count: restantes })}
        </p>
        <p className="text-muted-foreground font-mono text-xs">
          {t("seatsOf", {
            taken: formatNombre(forfait.seatsTaken),
            capacity: formatNombre(forfait.capacity),
          })}
        </p>
      </div>
      <div className="border-t pt-5">{reserver}</div>
    </aside>
  );
}

function Contenu({
  forfait,
  reserver,
}: Readonly<{ forfait: Package; reserver: ReactNode }>) {
  const t = useTranslations("packages");
  return (
    <div className="grid gap-10 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-10">
        <header className="space-y-3">
          <span
            className={cn(
              "inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold",
              forfait.type === "hadj"
                ? "bg-state-progress-bg text-state-progress"
                : "bg-primary-subtle text-primary",
            )}
          >
            {t(forfait.type === "hadj" ? "typeHadj" : "typeOumra")}
          </span>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">
            {forfait.title}
          </h1>
          <p className="text-muted-foreground flex flex-wrap items-center gap-x-4 gap-y-1">
            <span className="flex items-center gap-2">
              <CalendarDays aria-hidden className="size-4" />
              {t("detail.dates", {
                start: formatDate(forfait.startDate),
                end: formatDate(forfait.endDate),
              })}
            </span>
            <span>{t("duration", { days: dureeJours(forfait) })}</span>
          </p>
        </header>

        {forfait.description && (
          <section className="space-y-3" aria-labelledby="forfait-a-propos">
            <h2 id="forfait-a-propos" className="text-xl font-semibold">
              {t("detail.about")}
            </h2>
            <p className="text-muted-foreground whitespace-pre-line">
              {forfait.description}
            </p>
          </section>
        )}

        <section className="space-y-4" aria-labelledby="forfait-itineraire">
          <h2 id="forfait-itineraire" className="text-xl font-semibold">
            {t("detail.itinerary")}
          </h2>
          <Itineraire forfait={forfait} />
        </section>

        <section className="space-y-4" aria-labelledby="forfait-inclusions">
          <h2 id="forfait-inclusions" className="text-xl font-semibold">
            {t("detail.inclusions")}
          </h2>
          {forfait.inclusions.length > 0 ? (
            <ul className="grid gap-3 sm:grid-cols-2">
              {forfait.inclusions.map((inclusion) => (
                <li
                  key={inclusion}
                  className="flex items-start gap-3 rounded-lg border p-3 text-sm"
                >
                  <span className="bg-state-success-bg text-state-success inline-flex size-5 shrink-0 items-center justify-center rounded-full">
                    <Check aria-hidden className="size-3" />
                  </span>
                  {inclusion}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-muted-foreground text-sm">
              {t("detail.inclusionsEmpty")}
            </p>
          )}
        </section>

        <section
          className="bg-muted/50 flex items-center justify-between gap-4 rounded-xl border p-5"
          aria-labelledby="forfait-agence"
        >
          <div className="flex items-center gap-3">
            <span className="bg-primary-subtle text-primary inline-flex size-10 items-center justify-center rounded-lg">
              <Building2 aria-hidden className="size-5" />
            </span>
            <h2 id="forfait-agence" className="font-semibold">
              {t("detail.agency")}
            </h2>
          </div>
          <Link
            href={`/agencies/${forfait.agencyId}`}
            className="text-primary text-sm font-medium hover:underline"
          >
            {t("detail.agencyLink")}
          </Link>
        </section>
      </div>

      <CarteReservation forfait={forfait} reserver={reserver} />
    </div>
  );
}

export function PackageDetailScreen({
  id,
  reserver,
}: Readonly<{ id: string; reserver: (forfait: Package) => ReactNode }>) {
  const t = useTranslations("packages");
  const query = usePackage(id);
  const introuvable =
    query.error instanceof ApiError && query.error.statusCode === 404;

  return (
    <div className="space-y-6">
      <Link
        href="/packages"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("detail.back")}
      </Link>
      {introuvable ? (
        <EmptyState
          title={t("detail.notFoundTitle")}
          action={
            <Link
              href="/packages"
              className="text-primary text-sm font-medium hover:underline"
            >
              {t("detail.notFoundAction")}
            </Link>
          }
        />
      ) : (
        <AsyncBoundary query={query} skeleton={<Squelette />}>
          {(forfait) => (
            <Contenu forfait={forfait} reserver={reserver(forfait)} />
          )}
        </AsyncBoundary>
      )}
    </div>
  );
}
