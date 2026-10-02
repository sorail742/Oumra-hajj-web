"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { ArrowRight } from "lucide-react";
import { useAgencies } from "../api/use-agencies";
import {
  agencyValidationStatusSchema,
  type Agency,
  type AgencyValidationStatus,
} from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

/**
 * Liste des agences pour l'administrateur (ticket #31) : filtre de statut
 * dans l'URL (règle 8), « En attente » par défaut — c'est ce qui demande
 * une action. La décision se prend sur la page du dossier, documents sous
 * les yeux, jamais depuis la liste.
 */

const FILTRES = ["pending", "approved", "rejected", "all"] as const;
type Filtre = (typeof FILTRES)[number];

export function cheminDossier(id: string): string {
  return `/agencies/${encodeURIComponent(id)}/validation`;
}

function useFiltreStatut(): [Filtre, (filtre: Filtre) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const brut = params.get("status");
  const filtre: Filtre =
    brut === "all"
      ? "all"
      : (agencyValidationStatusSchema.safeParse(brut).data ?? "pending");

  function choisir(suivant: Filtre) {
    const query = new URLSearchParams(params.toString());
    query.set("status", suivant);
    router.replace(`?${query.toString()}`, { scroll: false });
  }
  return [filtre, choisir];
}

function LienDossier({ agence }: Readonly<{ agence: Agency }>) {
  const t = useTranslations("agencies");
  return (
    <Link
      href={cheminDossier(agence.id)}
      className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
    >
      {t("review")}
      <ArrowRight aria-hidden className="size-4" />
    </Link>
  );
}

export function AgenciesListScreen() {
  const t = useTranslations("agencies");
  const [filtre, choisir] = useFiltreStatut();
  const status: AgencyValidationStatus | undefined =
    filtre === "all" ? undefined : filtre;
  const query = useAgencies(status);

  const columns: ColumnDef<Agency>[] = useMemo(
    () => [
      { accessorKey: "legalName", header: t("columns.legalName") },
      { accessorKey: "contactEmail", header: t("columns.contactEmail") },
      {
        accessorKey: "contactPhone",
        header: t("columns.contactPhone"),
        cell: ({ row }) => (
          <span className="font-mono text-sm">{row.original.contactPhone}</span>
        ),
      },
      {
        id: "documents",
        header: t("columns.documents"),
        cell: ({ row }) =>
          t("documentsCount", { count: row.original.legalDocuments.length }),
      },
      {
        accessorKey: "validationStatus",
        header: t("columns.status"),
        cell: ({ row }) => (
          <StatusBadge kind="agency" value={row.original.validationStatus} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => <LienDossier agence={row.original} />,
      },
    ],
    [t],
  );

  return (
    <div className="space-y-4">
      <SegmentedControl
        label={t("filter.label")}
        value={filtre}
        onChange={choisir}
        options={FILTRES.map((valeur) => ({
          value: valeur,
          label: t(`filter.${valeur}`),
        }))}
      />
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={6} />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(agences) => (
          <DataTable
            data={agences}
            columns={columns}
            getRowId={(a) => a.id}
            renderCard={(a) => (
              <div className="space-y-3 rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{a.legalName}</span>
                  <StatusBadge kind="agency" value={a.validationStatus} />
                </div>
                <div className="text-muted-foreground space-y-1 text-xs">
                  <p>{a.contactEmail}</p>
                  <p className="font-mono">{a.contactPhone}</p>
                  <p>
                    {t("documentsCount", { count: a.legalDocuments.length })}
                  </p>
                </div>
                <LienDossier agence={a} />
              </div>
            )}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}
