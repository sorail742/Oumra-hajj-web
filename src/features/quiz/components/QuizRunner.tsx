"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, XCircle } from "lucide-react";
import { useQuizQuestions, useRepondre } from "../api/use-quiz";
import type { QuizAttemptResult, QuizQuestion } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "@/lib/utils";

/**
 * Quiz d'une fiche de rite, question par question (ticket #80) : choix,
 * correction immédiate avec explication, puis score. Le backend ne renvoie
 * au pèlerin que des questions validées ; la bonne réponse n'arrive
 * qu'après la tentative.
 */
function Question({
  question,
  rang,
  total,
  onSuivante,
}: Readonly<{
  question: QuizQuestion;
  rang: number;
  total: number;
  onSuivante: (correct: boolean) => void;
}>) {
  const t = useTranslations("quiz.run");
  const repondre = useRepondre();
  const [choix, setChoix] = useState<number | null>(null);
  const [resultat, setResultat] = useState<QuizAttemptResult | null>(null);
  const [erreur, setErreur] = useState(false);

  async function valider() {
    if (choix === null) return;
    setErreur(false);
    try {
      setResultat(
        await repondre.mutateAsync({
          questionId: question.id,
          selectedOption: choix,
        }),
      );
    } catch {
      setErreur(true);
    }
  }

  return (
    <div className="space-y-4">
      <p className="text-muted-foreground text-sm">
        {t("progress", { rang, total })}
      </p>
      <fieldset className="space-y-2" disabled={resultat !== null}>
        <legend className="mb-3 text-base font-semibold">
          {question.question}
        </legend>
        {question.options.map((option, i) => {
          const bonne = resultat?.correctOption === i;
          const fausse = resultat !== null && choix === i && !bonne;
          return (
            <label
              key={`${i}-${option}`}
              className={cn(
                "flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 text-sm",
                choix === i && "border-primary",
                bonne && "border-state-success bg-state-success-bg",
                fausse && "border-state-danger bg-state-danger-bg",
              )}
            >
              <input
                type="radio"
                name={`question-${question.id}`}
                checked={choix === i}
                onChange={() => setChoix(i)}
                className="accent-primary size-4"
              />
              <span className="flex-1">{option}</span>
              {bonne && (
                <CheckCircle2
                  aria-hidden
                  className="text-state-success size-4"
                />
              )}
              {fausse && (
                <XCircle aria-hidden className="text-state-danger size-4" />
              )}
            </label>
          );
        })}
      </fieldset>

      {erreur && (
        <p role="alert" className="text-state-danger text-sm">
          {t("error")}
        </p>
      )}

      {resultat ? (
        <div className="space-y-3">
          <output
            className={cn(
              "block rounded-md px-3 py-2 text-sm font-medium",
              resultat.isCorrect
                ? "bg-state-success-bg text-state-success"
                : "bg-state-danger-bg text-state-danger",
            )}
          >
            {resultat.isCorrect
              ? t("correct")
              : t("incorrect", {
                  answer: question.options[resultat.correctOption] ?? "",
                })}
          </output>
          {resultat.explanation && (
            <p className="text-sm">
              <span className="font-medium">{t("explanation")} </span>
              {resultat.explanation}
            </p>
          )}
          <Button onClick={() => onSuivante(resultat.isCorrect)}>
            {rang < total ? t("next") : t("finish")}
          </Button>
        </div>
      ) : (
        <Button
          onClick={valider}
          disabled={choix === null || repondre.isPending}
        >
          {t("submit")}
        </Button>
      )}
    </div>
  );
}

export function QuizRunner({ riteSheetId }: Readonly<{ riteSheetId: string }>) {
  const t = useTranslations("quiz.run");
  const query = useQuizQuestions(riteSheetId);
  const [rang, setRang] = useState(0);
  const [bonnes, setBonnes] = useState(0);

  function recommencer() {
    setRang(0);
    setBonnes(0);
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-64 w-full max-w-2xl" />}
      empty={
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      }
    >
      {(questions) => {
        const courante = questions[rang];
        return (
          <section className="bg-card max-w-2xl rounded-xl border p-5">
            {courante ? (
              <Question
                key={courante.id}
                question={courante}
                rang={rang + 1}
                total={questions.length}
                onSuivante={(correct) => {
                  if (correct) setBonnes((n) => n + 1);
                  setRang((r) => r + 1);
                }}
              />
            ) : (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">{t("doneTitle")}</h2>
                <p className="text-sm">
                  {t("score", { bonnes, total: questions.length })}
                </p>
                <Button variant="outline" onClick={recommencer}>
                  {t("restart")}
                </Button>
              </div>
            )}
          </section>
        );
      }}
    </AsyncBoundary>
  );
}
