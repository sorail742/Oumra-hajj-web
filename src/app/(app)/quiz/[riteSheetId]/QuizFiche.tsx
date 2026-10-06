"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { QuizRunner } from "@/features/quiz/components/QuizRunner";
import { useRiteSheets } from "@/features/rites/api/use-rites";

/** Quiz d'une fiche : titre depuis les rites, déroulé depuis le quiz (règle 2). */
export function QuizFiche({ riteSheetId }: Readonly<{ riteSheetId: string }>) {
  const t = useTranslations("quiz.hub");
  const { data: fiches = [] } = useRiteSheets();
  const titre = fiches.find((f) => f.id === riteSheetId)?.title;

  return (
    <div className="space-y-4">
      <Link
        href="/quiz"
        className="text-primary inline-flex items-center gap-2 text-sm font-medium hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("back")}
      </Link>
      {titre && <h2 className="text-lg font-medium">{titre}</h2>}
      <Can
        role="pilgrim"
        fallback={
          <p className="text-muted-foreground text-sm">{t("pilgrimOnly")}</p>
        }
      >
        <QuizRunner riteSheetId={riteSheetId} />
      </Can>
    </div>
  );
}
