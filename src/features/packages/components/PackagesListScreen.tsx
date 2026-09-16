"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { usePackages } from "../api/use-packages";
import type { Package, PackageFilters } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

const LIBELLE_TYPE: Record<Package["type"], string> = {
  oumra: "Oumra",
  hadj: "Hadj",
};

function useFiltres(): [
  PackageFilters,
  (patch: Partial<PackageFilters>) => void,
] {
  const params = useSearchParams();
  const router = useRouter();

  const filtres: PackageFilters = useMemo(
    () => ({
      type: (params.get("type") as PackageFilters["type"]) || undefined,
      maxBudget: params.get("maxBudget")
        ? Number(params.get("maxBudget"))
        : undefined,
    }),
    [params],
  );

  function definir(patch: Partial<PackageFilters>) {
    const suivant = new URLSearchParams(params.toString());
    for (const [cle, valeur] of Object.entries(patch)) {
      if (valeur === undefined || valeur === "") {
        suivant.delete(cle);
      } else {
        suivant.set(cle, String(valeur));
      }
    }
    router.replace(`?${suivant.toString()}`);
  }

  return [filtres, definir];
}

export function PackagesListScreen() {
  const t = useTranslations("packages");
  const [filtres, definirFiltre] = useFiltres();
  const query = usePackages(filtres);

  const columns: ColumnDef<Package>[] = useMemo(
    () => [
      { accessorKey: "title", header: t("columnTitle") },
      {
        accessorKey: "type",
        header: t("columnType"),
        cell: ({ row }) => LIBELLE_TYPE[row.original.type],
      },
      {
        accessorKey: "price",
        header: t("columnPrice"),
        cell: ({ row }) => <Money montant={row.original.price} />,
      },
      { accessorKey: "capacity", header: t("columnCapacity") },
      {
        accessorKey: "status",
        header: t("columnStatus"),
        cell: ({ row }) => (
          <StatusBadge kind="package" value={row.original.status} />
        ),
      },
    ],
    [t],
  );

  return (
    <div>
      <FilterBar>
        <div className="space-y-1">
          <Label htmlFor="filtre-type">{t("filterType")}</Label>
          <select
            id="filtre-type"
            className="border-input bg-background h-(--size-field) rounded-md border px-3 text-sm"
            value={filtres.type ?? ""}
            onChange={(e) =>
              definirFiltre({
                type: (e.target.value || undefined) as PackageFilters["type"],
              })
            }
          >
            <option value="">{t("filterTypeAll")}</option>
            <option value="oumra">Oumra</option>
            <option value="hadj">Hadj</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filtre-budget">{t("filterMaxBudget")}</Label>
          <Input
            id="filtre-budget"
            type="number"
            inputMode="numeric"
            className="w-40"
            value={filtres.maxBudget ?? ""}
            onChange={(e) =>
              definirFiltre({
                maxBudget: e.target.value ? Number(e.target.value) : undefined,
              })
            }
          />
        </div>
      </FilterBar>

      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={8} />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(packages) => (
          <DataTable
            data={packages}
            columns={columns}
            getRowId={(p) => p.id}
            renderCard={(p) => (
              <div className="rounded-lg border p-4">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{p.title}</span>
                  <StatusBadge kind="package" value={p.status} />
                </div>
                <div className="text-muted-foreground mt-1 text-xs">
                  {LIBELLE_TYPE[p.type]} · {formatDate(p.startDate)}
                </div>
                <div className="mt-2">
                  <Money montant={p.price} />
                </div>
              </div>
            )}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}
