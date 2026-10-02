"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { CalendarDays, ExternalLink, Pencil, Plus } from "lucide-react";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatDate } from "@/lib/format";
import { useMyPackages } from "../api/use-my-packages";
import type { Package } from "../api/schemas";
import { placesRestantes, tauxRemplissage } from "../lib/forfait";
import { ClosePackageDialog } from "./ClosePackageDialog";

/** Forfaits de l'agence (ticket #33) : remplissage, actions par forfait. */

function LigneForfait({ forfait }: Readonly<{ forfait: Package }>) {
  const t = useTranslations("packages");
  const taux = tauxRemplissage(forfait);
  return (
    <li className="bg-card flex flex-col gap-4 rounded-xl border p-5 shadow-(--shadow-raised) lg:flex-row lg:items-center">
      <div className="min-w-0 flex-1 space-y-1.5">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="truncate font-semibold">{forfait.title}</h3>
          <StatusBadge kind="package" value={forfait.status} />
        </div>
        <p className="text-muted-foreground flex items-center gap-2 text-sm">
          <CalendarDays aria-hidden className="size-4" />
          {t("detail.dates", {
            start: formatDate(forfait.startDate),
            end: formatDate(forfait.endDate),
          })}
        </p>
      </div>
      <div className="w-full space-y-1 lg:w-48">
        <p className="text-sm font-medium">
          {t("seatsLeft", { count: placesRestantes(forfait) })}
        </p>
        <div className="bg-muted h-1.5 overflow-hidden rounded-full">
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${Math.round(taux * 100)}%` }}
          />
        </div>
      </div>
      <p className="text-lg font-semibold lg:w-44 lg:text-right">
        <Money montant={forfait.price} />
      </p>
      <div className="flex flex-wrap items-center gap-1">
        <Link
          href={`/my-packages/${forfait.id}/edit`}
          className="hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium"
        >
          <Pencil aria-hidden className="size-3.5" />
          {t("manage.edit")}
        </Link>
        <Link
          href={`/packages/${forfait.id}`}
          className="hover:bg-muted inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm"
        >
          <ExternalLink aria-hidden className="size-3.5" />
          {t("manage.view")}
        </Link>
        {forfait.status !== "closed" && (
          <ClosePackageDialog packageId={forfait.id} />
        )}
      </div>
    </li>
  );
}

export function MyPackagesScreen() {
  const t = useTranslations("packages.manage");
  const query = useMyPackages();
  return (
    <AsyncBoundary
      query={query}
      skeleton={<TableSkeleton rows={4} />}
      empty={
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
          action={
            <Link
              href="/my-packages/new"
              className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium"
            >
              <Plus aria-hidden className="size-4" />
              {t("create")}
            </Link>
          }
        />
      }
    >
      {(forfaits) => (
        <ul className="space-y-3">
          {forfaits.map((forfait) => (
            <LigneForfait key={forfait.id} forfait={forfait} />
          ))}
        </ul>
      )}
    </AsyncBoundary>
  );
}
