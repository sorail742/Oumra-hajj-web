"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Can } from "@/components/shared/Can";
import { PendingQuestionsQueue } from "@/features/quiz/components/PendingQuestionsQueue";
import { QuestionProposalForm } from "@/features/quiz/components/QuestionProposalForm";
import { QuizStatsCard } from "@/features/quiz/components/QuizStatsCard";
import { useRiteSheets } from "@/features/rites/api/use-rites";

/**
 * Compose deux domaines (fiches de rites → quiz) : rôle d'un fichier de
 * page, jamais d'un `features/*` (règle 2).
 */
export function QuizHub() {
  const t = useTranslations("quiz.hub");
  const { data: fiches = [] } = useRiteSheets();
  const titres = new Map(fiches.map((f) => [f.id, f.title]));

  return (
    <div className="space-y-8">
      <Can role="pilgrim">
        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t("statsTitle")}</h2>
          <QuizStatsCard titres={titres} />
        </section>
        <section className="space-y-3">
          <h2 className="text-lg font-medium">{t("sheetsTitle")}</h2>
          {fiches.length === 0 ? (
            <p className="text-muted-foreground text-sm">{t("noSheet")}</p>
          ) : (
            <ul className="bg-card divide-y rounded-xl border">
              {fiches.map((f) => (
                <li
                  key={f.id}
                  className="flex items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="font-medium">{f.title}</span>
                  <Link
                    href={`/quiz/${encodeURIComponent(f.id)}`}
                    className="text-primary font-medium hover:underline"
                  >
                    {t("practice")}
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </Can>
      <Can role="admin">
        <PendingQuestionsQueue titres={titres} />
      </Can>
      <Can role={["guide", "admin"]}>
        <QuestionProposalForm
          fiches={fiches.map((f) => ({ id: f.id, titre: f.title }))}
        />
      </Can>
    </div>
  );
}
