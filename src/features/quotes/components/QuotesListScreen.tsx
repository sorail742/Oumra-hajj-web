"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useDevis } from "../api/use-quotes";
import {
  QUOTE_STATUSES,
  statutAffiche,
  type QuoteStatus,
} from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";

function lireStatut(brut: string | null): QuoteStatus | undefined {
  return QUOTE_STATUSES.find((s) => s === brut);
}

/** Devis de l'agence (idée #49), filtrés par statut dans l'URL (règle 8). */
export function QuotesListScreen() {
  const t = useTranslations("quotes");
  const params = useSearchParams();
  const router = useRouter();
  const statut = lireStatut(params.get("status"));
  const query = useDevis(statut);

  function choisir(valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set("status", valeur);
    else suivant.delete("status");
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-1">
        <Label htmlFor="filtre-statut">{t("filterStatus")}</Label>
        <select
          id="filtre-statut"
          value={statut ?? ""}
          onChange={(e) => choisir(e.target.value)}
          className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
        >
          <option value="">{t("allStatuses")}</option>
          {QUOTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`statuses.${s}`)}
            </option>
          ))}
        </select>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={5} />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(devis) => (
          <ul className="space-y-3">
            {devis.map((d) => (
              <li key={d.id}>
                <Link
                  href={`/quotes/${d.id}`}
                  className="bg-card hover:bg-muted/50 flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 shadow-(--shadow-card)"
                >
                  <div className="min-w-0 space-y-1">
                    <p className="font-mono text-sm">{d.number}</p>
                    <p className="font-semibold">{d.clientName}</p>
                    <p className="text-muted-foreground text-sm">
                      {t("summary", {
                        count: d.pilgrimsCount,
                        date: formatDate(d.validUntil),
                      })}
                    </p>
                  </div>
                  <div className="space-y-1 text-right">
                    <StatusBadge kind="quote" value={statutAffiche(d)} />
                    <p>
                      <Money montant={d.totalAmount} devise={d.currency} />
                    </p>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}
