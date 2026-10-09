"use client";

import { useTranslations } from "next-intl";
import { useCouverture } from "../api/use-on-call";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateHeure, formatNombre, formatPourcentage } from "@/lib/format";

/**
 * Couverture d'un voyage (idée #63) : part du séjour où quelqu'un est
 * d'astreinte, et périodes où personne ne l'est.
 */
export function CoverageCard({ packageId }: Readonly<{ packageId: string }>) {
  const t = useTranslations("onCall.coverage");
  const query = useCouverture(packageId);

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-32 w-full" />}
      isEmpty={() => false}
    >
      {(c) => {
        const complet = c.gaps.length === 0;
        return (
          <section className="bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-semibold">
                {t("title", { title: c.packageTitle })}
              </h2>
              <p className="text-sm tabular-nums">
                {t("hours", {
                  covered: formatNombre(c.coveredHours),
                  total: formatNombre(c.totalHours),
                  rate: formatPourcentage(
                    c.totalHours > 0
                      ? (c.coveredHours / c.totalHours) * 100
                      : 0,
                    0,
                  ),
                })}
              </p>
            </div>
            {complet ? (
              <p className="text-success text-sm">{t("complete")}</p>
            ) : (
              <div className="space-y-2">
                <p className="text-warning text-sm font-medium">
                  {t("gaps", { count: c.gaps.length })}
                </p>
                <ul className="space-y-1 text-sm">
                  {c.gaps.map((g) => (
                    <li key={g.from} className="tabular-nums">
                      {t("gap", {
                        from: formatDateHeure(g.from),
                        to: formatDateHeure(g.to),
                      })}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </section>
        );
      }}
    </AsyncBoundary>
  );
}
