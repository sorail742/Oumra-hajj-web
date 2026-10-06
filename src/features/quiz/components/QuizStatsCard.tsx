"use client";

import { useTranslations } from "next-intl";
import { useMesStatsQuiz } from "../api/use-quiz";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPourcentage } from "@/lib/format";

/**
 * Statistiques personnelles du pèlerin (ticket #80) : score global et
 * réussite par fiche. Les titres des fiches viennent de la page (règle 2).
 */
export function QuizStatsCard({
  titres,
}: Readonly<{ titres: ReadonlyMap<string, string> }>) {
  const t = useTranslations("quiz.stats");
  const query = useMesStatsQuiz();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-32 w-full" />}
      isEmpty={(stats) => stats.totalAttempts === 0}
      empty={<p className="text-muted-foreground text-sm">{t("empty")}</p>}
    >
      {(stats) => {
        const parFiche = new Map<string, { total: number; bonnes: number }>();
        for (const tentative of stats.attempts) {
          const id = tentative.question.riteSheetId;
          const cumul = parFiche.get(id) ?? { total: 0, bonnes: 0 };
          cumul.total += 1;
          if (tentative.isCorrect) cumul.bonnes += 1;
          parFiche.set(id, cumul);
        }
        return (
          <section className="bg-card space-y-4 rounded-xl border p-5">
            <p className="text-sm">
              {t("global", {
                bonnes: stats.correctAttempts,
                total: stats.totalAttempts,
                part: formatPourcentage(stats.scorePercentage, 0),
              })}
            </p>
            <h2 className="text-sm font-medium">{t("bySheet")}</h2>
            <ul className="divide-y rounded-lg border">
              {[...parFiche].map(([id, { total, bonnes }]) => (
                <li
                  key={id}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <span className="font-medium">
                    {titres.get(id) ?? t("unknownSheet")}
                  </span>
                  <span className="tabular-nums">
                    {t("sheetScore", {
                      bonnes,
                      total,
                      part: formatPourcentage((bonnes / total) * 100, 0),
                    })}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        );
      }}
    </AsyncBoundary>
  );
}
