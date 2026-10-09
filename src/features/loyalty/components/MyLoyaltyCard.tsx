"use client";

import { useTranslations } from "next-intl";
import { Award } from "lucide-react";
import { useMaFidelite } from "../api/use-loyalty";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

/** Fidélité du pèlerin auprès de chaque agence avec laquelle il a voyagé (idée #47). */
export function MyLoyaltyCard() {
  const t = useTranslations("loyalty.mine");
  const query = useMaFidelite();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-32 w-full" />}
      empty={
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      }
    >
      {(agences) => (
        <ul className="grid gap-4 sm:grid-cols-2">
          {agences.map((a) => (
            <li
              key={a.agencyId}
              className="bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)"
            >
              <div className="flex items-start gap-3">
                <span className="bg-primary-subtle text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-md">
                  <Award aria-hidden className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{a.agencyName}</p>
                  <p className="text-muted-foreground text-sm">
                    {t("trips", { count: a.trips })}
                  </p>
                </div>
              </div>
              {a.tier ? (
                <div>
                  <p className="font-medium">{a.tier.label}</p>
                  <p className="text-sm">{a.tier.benefit}</p>
                </div>
              ) : (
                <p className="text-muted-foreground text-sm">{t("noTier")}</p>
              )}
              {a.nextTier && (
                <p className="text-muted-foreground text-sm">
                  {t("next", {
                    count: a.nextTier.tripsToGo,
                    label: a.nextTier.label,
                  })}
                </p>
              )}
              <p className="text-muted-foreground text-xs">{t("grantedBy")}</p>
            </li>
          ))}
        </ul>
      )}
    </AsyncBoundary>
  );
}
