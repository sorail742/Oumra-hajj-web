"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ChevronRight } from "lucide-react";
import { useLitiges } from "../api/use-disputes";
import { DISPUTE_STATUSES, type DisputeStatus } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Label } from "@/components/ui/label";

function lireStatut(valeur: string | null): DisputeStatus | undefined {
  return DISPUTE_STATUSES.find((s) => s === valeur);
}

/**
 * Litiges visibles par l'utilisateur (idée #62) — les siens pour le
 * pèlerin, ceux de son agence pour l'agence, les escaladés et tranchés
 * pour l'administration (filtrage par le backend). Statut dans l'URL.
 */
export function DisputesListScreen() {
  const t = useTranslations("disputes");
  const tcat = useTranslations("disputes.categories");
  const params = useSearchParams();
  const router = useRouter();
  const statut = lireStatut(params.get("status"));
  const query = useLitiges(statut);

  function choisir(valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set("status", valeur);
    else suivant.delete("status");
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="max-w-xs space-y-1">
        <Label htmlFor="filtre-statut">{t("filterStatus")}</Label>
        <select
          id="filtre-statut"
          value={statut ?? ""}
          onChange={(e) => choisir(e.target.value)}
          className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
        >
          <option value="">{t("allStatuses")}</option>
          {DISPUTE_STATUSES.map((s) => (
            <option key={s} value={s}>
              {t(`statusFilter.${s}`)}
            </option>
          ))}
        </select>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={4} />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(litiges) => (
          <ul className="bg-card divide-y rounded-lg border shadow-(--shadow-card)">
            {litiges.map((l) => (
              <li key={l.id}>
                <Link
                  href={`/disputes/${l.id}`}
                  className="hover:bg-muted/60 flex items-center gap-3 px-4 py-4"
                >
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium">{l.subject}</span>
                      <StatusBadge kind="dispute" value={l.status} />
                    </div>
                    <p className="text-muted-foreground text-sm">
                      {tcat(l.category)} · {l.packageTitle} ·{" "}
                      {t("parties", {
                        pilgrim: l.pilgrimName,
                        agency: l.agencyName,
                      })}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {t("updated")} <RelativeTime iso={l.updatedAt} />
                    </p>
                  </div>
                  <ChevronRight
                    aria-hidden
                    className="text-muted-foreground size-4 shrink-0"
                  />
                </Link>
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}
