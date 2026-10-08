"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import {
  lienCsvComptable,
  periodeValide,
  useJournalComptable,
  type AccountingEntry,
  type PeriodeComptable,
} from "../api/use-accounting";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Money } from "@/components/shared/Money";
import { StatCard, StatGrid } from "@/components/shared/StatCard";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

const DATE_JOUR = /^\d{4}-\d{2}-\d{2}$/;

function lireDate(valeur: string | null): string | undefined {
  return valeur && DATE_JOUR.test(valeur) ? valeur : undefined;
}

/**
 * Export comptable de l'agence (idée #57) : journal des encaissements et
 * remboursements sur une période (dans l'URL, règle 8 ; mois en cours par
 * défaut), totaux, aperçu des écritures et téléchargement CSV prêt pour
 * Excel ou un import Sage.
 */
export function AccountingExportCard() {
  const t = useTranslations("payments.accounting");
  const params = useSearchParams();
  const router = useRouter();
  const periode: PeriodeComptable = {
    from: lireDate(params.get("from")),
    to: lireDate(params.get("to")),
  };
  const valide = periodeValide(periode);
  const query = useJournalComptable(periode);

  function definir(cle: "from" | "to", valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set(cle, valeur);
    else suivant.delete(cle);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  const columns: ColumnDef<AccountingEntry>[] = useMemo(
    () => [
      {
        accessorKey: "date",
        header: t("columnDate"),
        cell: ({ row }) => formatDate(row.original.date),
      },
      {
        accessorKey: "journal",
        header: t("columnJournal"),
        cell: ({ row }) => t(`journals.${row.original.journal}`),
      },
      {
        accessorKey: "pieceRef",
        header: t("columnPiece"),
        cell: ({ row }) => (
          <span className="block max-w-40 font-mono text-xs break-all whitespace-normal">
            {row.original.pieceRef}
          </span>
        ),
      },
      {
        accessorKey: "label",
        header: t("columnLabel"),
        cell: ({ row }) => (
          <span className="block min-w-48 whitespace-normal">
            {row.original.label}
          </span>
        ),
      },
      {
        accessorKey: "debit",
        header: t("columnDebit"),
        cell: ({ row }) =>
          row.original.debit > 0 ? (
            <Money montant={row.original.debit} />
          ) : null,
      },
      {
        accessorKey: "credit",
        header: t("columnCredit"),
        cell: ({ row }) =>
          row.original.credit > 0 ? (
            <Money montant={row.original.credit} />
          ) : null,
      },
    ],
    [t],
  );

  return (
    <section className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        {valide && (
          <Button asChild variant="outline">
            <a href={lienCsvComptable(periode)} download>
              <Download aria-hidden className="size-4" />
              {t("download")}
            </a>
          </Button>
        )}
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="space-y-1">
          <Label htmlFor="compta-du">{t("from")}</Label>
          <Input
            id="compta-du"
            type="date"
            className="w-44"
            value={periode.from ?? ""}
            onChange={(e) => definir("from", e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="compta-au">{t("to")}</Label>
          <Input
            id="compta-au"
            type="date"
            className="w-44"
            value={periode.to ?? ""}
            onChange={(e) => definir("to", e.target.value)}
          />
        </div>
        {query.data && (
          <p className="text-muted-foreground pb-2 text-sm">
            {t("period", {
              from: formatDate(query.data.from),
              to: formatDate(query.data.to),
            })}
          </p>
        )}
      </div>
      {valide ? (
        <AsyncBoundary
          query={query}
          skeleton={<TableSkeleton rows={4} />}
          isEmpty={(journal) => journal.entries.length === 0}
          empty={
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          }
        >
          {(journal) => (
            <div className="space-y-4">
              <StatGrid columns={3}>
                <StatCard
                  title={t("collected")}
                  value={<Money montant={journal.totalCollected} />}
                />
                <StatCard
                  title={t("refunded")}
                  value={<Money montant={journal.totalRefunded} />}
                />
                <StatCard
                  title={t("net")}
                  value={<Money montant={journal.net} />}
                />
              </StatGrid>
              <DataTable
                data={journal.entries}
                columns={columns}
                getRowId={(e) => `${e.journal}-${e.pieceRef}`}
                renderCard={(e) => (
                  <div className="space-y-1 rounded-lg border p-4 text-sm">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-medium">
                        {t(`journals.${e.journal}`)}
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {formatDate(e.date)}
                      </span>
                    </div>
                    <p>{e.label}</p>
                    <Money montant={e.debit > 0 ? e.debit : e.credit} />
                  </div>
                )}
              />
            </div>
          )}
        </AsyncBoundary>
      ) : (
        <p role="alert" className="text-destructive text-sm">
          {t("invalidPeriod")}
        </p>
      )}
    </section>
  );
}
