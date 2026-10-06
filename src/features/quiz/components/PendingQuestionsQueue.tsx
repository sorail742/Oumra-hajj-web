"use client";

import { useTranslations } from "next-intl";
import { Check } from "lucide-react";
import { toast } from "sonner";
import {
  useQuestionsEnAttente,
  useRefuserQuestion,
  useValiderQuestion,
} from "../api/use-quiz";
import type { QuizQuestionAdmin } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * File de validation des questions proposées (administrateur, ticket #81).
 * Publier ou refuser se confirme explicitement ; une question n'est
 * visible des pèlerins qu'une fois publiée (règle 13).
 */
function QuestionEnAttente({
  question,
  titreFiche,
}: Readonly<{ question: QuizQuestionAdmin; titreFiche: string }>) {
  const t = useTranslations("quiz.pending");
  const valider = useValiderQuestion();
  const refuser = useRefuserQuestion();

  function avecToast(action: Promise<unknown>, succes: string) {
    return action.then(
      () => toast.success(succes),
      (erreur: unknown) => {
        toast.error(t("error"));
        throw erreur;
      },
    );
  }

  return (
    <li className="space-y-3 p-4">
      <ReligiousContentNotice validated={question.isValidated} />
      <p className="text-muted-foreground text-xs">{titreFiche}</p>
      <p className="font-medium">{question.question}</p>
      <ol className="space-y-1 text-sm">
        {question.options.map((option, i) => (
          <li
            key={`${i}-${option}`}
            className={cn(
              "flex items-center gap-2",
              i === question.correctOption && "text-state-success font-medium",
            )}
          >
            {i === question.correctOption ? (
              <Check aria-hidden className="size-4" />
            ) : (
              <span aria-hidden className="size-4" />
            )}
            {option}
            {i === question.correctOption && (
              <span className="sr-only">{t("correctAnswer")}</span>
            )}
          </li>
        ))}
      </ol>
      {question.explanation && (
        <p className="text-muted-foreground text-sm">{question.explanation}</p>
      )}
      <div className="flex flex-wrap gap-2">
        <ConfirmDialog
          trigger={<Button size="sm">{t("validate")}</Button>}
          title={t("validateTitle")}
          description={t("validateBody")}
          confirmLabel={t("validate")}
          enCours={valider.isPending}
          onConfirm={() =>
            avecToast(valider.mutateAsync(question.id), t("validated"))
          }
        />
        <ConfirmDialog
          trigger={
            <Button size="sm" variant="outline">
              {t("reject")}
            </Button>
          }
          title={t("rejectTitle")}
          description={t("rejectBody")}
          confirmLabel={t("reject")}
          destructive
          enCours={refuser.isPending}
          onConfirm={() =>
            avecToast(refuser.mutateAsync(question.id), t("rejected"))
          }
        />
      </div>
    </li>
  );
}

export function PendingQuestionsQueue({
  titres,
}: Readonly<{ titres: ReadonlyMap<string, string> }>) {
  const t = useTranslations("quiz.pending");
  const query = useQuestionsEnAttente();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">{t("title")}</h2>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-40 w-full" />}
        empty={<p className="text-muted-foreground text-sm">{t("empty")}</p>}
      >
        {(questions) => (
          <ul className="bg-card divide-y rounded-xl border">
            {questions.map((q) => (
              <QuestionEnAttente
                key={q.id}
                question={q}
                titreFiche={titres.get(q.riteSheetId) ?? t("unknownSheet")}
              />
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </section>
  );
}
