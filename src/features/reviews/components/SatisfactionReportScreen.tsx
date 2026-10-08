"use client";

import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import {
  LIEN_EXPORT_SATISFACTION_CSV,
  useSatisfactionReport,
} from "../api/use-reviews";
import { RatingStars } from "./RatingStars";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ProportionList } from "@/components/shared/ProportionList";
import { RelativeTime } from "@/components/shared/RelativeTime";
import {
  StatCard,
  StatCardSkeleton,
  StatGrid,
} from "@/components/shared/StatCard";
import { formatDateHeure, formatNombre, formatNote } from "@/lib/format";

/**
 * Rapport de satisfaction de l'agence (ticket #78) : nombre d'avis, note
 * moyenne (« pas encore de note » plutôt qu'un zéro trompeur), répartition
 * des notes, commentaires, export CSV pour les partenaires financiers.
 */
const NOTES_DECROISSANTES = [5, 4, 3, 2, 1] as const;

export function SatisfactionReportScreen() {
  const t = useTranslations("reviews.report");
  const query = useSatisfactionReport();

  return (
    <AsyncBoundary
      query={query}
      isEmpty={() => false}
      skeleton={
        <div className="grid gap-4 sm:grid-cols-2">
          <StatCardSkeleton />
          <StatCardSkeleton />
        </div>
      }
    >
      {(rapport) => {
        const parNote = new Map(
          rapport.ratingDistribution.map((e) => [e.rating, e.count]),
        );
        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-muted-foreground text-sm">
                {t("generatedAt", {
                  date: formatDateHeure(rapport.generatedAt),
                })}
              </p>
              <a
                href={LIEN_EXPORT_SATISFACTION_CSV}
                download="rapport-satisfaction.csv"
                className="border-input bg-card hover:bg-muted inline-flex h-(--size-touch) items-center gap-2 rounded-md border px-4 text-sm font-medium"
              >
                <Download aria-hidden className="size-4" />
                {t("export")}
              </a>
            </div>
            <StatGrid columns={2}>
              <StatCard
                title={t("count")}
                value={formatNombre(rapport.reviewCount)}
              />
              <StatCard
                title={t("average")}
                value={
                  rapport.reviewAverage === undefined
                    ? t("noAverage")
                    : t("averageValue", {
                        note: formatNote(rapport.reviewAverage),
                      })
                }
              />
            </StatGrid>
            <section className="bg-card space-y-4 rounded-lg border p-5 shadow-(--shadow-card)">
              <h2 className="text-sm font-medium">{t("distribution")}</h2>
              <ProportionList
                items={NOTES_DECROISSANTES.map((note) => ({
                  key: String(note),
                  label: <RatingStars rating={note} />,
                  count: parNote.get(note) ?? 0,
                }))}
              />
            </section>
            <section className="space-y-3">
              <h2 className="text-lg font-medium">{t("comments")}</h2>
              {rapport.reviews.some((r) => r.comment) ? (
                <ul className="bg-card divide-y rounded-lg border">
                  {rapport.reviews
                    .filter((r) => r.comment)
                    .map((r) => (
                      <li
                        key={`${r.createdAt}-${r.rating}`}
                        className="space-y-1 px-4 py-3"
                      >
                        <div className="flex items-center justify-between gap-3">
                          <RatingStars rating={r.rating} />
                          <span className="text-muted-foreground text-xs">
                            <RelativeTime iso={r.createdAt} />
                          </span>
                        </div>
                        <p className="text-sm">{r.comment}</p>
                      </li>
                    ))}
                </ul>
              ) : (
                <p className="text-muted-foreground text-sm">
                  {t("noComments")}
                </p>
              )}
            </section>
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
