"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import {
  quizAttemptResultSchema,
  quizQuestionAdminSchema,
  quizQuestionSchema,
  quizStatsSchema,
} from "./schemas";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";

const enc = encodeURIComponent;

/** Questions publiées d'une fiche de rite (tickets #80). */
export function useQuizQuestions(riteSheetId: string) {
  return useQuery({
    queryKey: keys.quiz.questions(riteSheetId),
    queryFn: async () =>
      z
        .array(quizQuestionSchema)
        .parse(
          await api.get<unknown>(`/api/quiz/questions/${enc(riteSheetId)}`),
        ),
  });
}

export function useRepondre() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (reponse: {
      questionId: string;
      selectedOption: number;
    }) =>
      quizAttemptResultSchema.parse(
        await api.post<unknown>(
          `/api/quiz/questions/${enc(reponse.questionId)}/attempts`,
          { selectedOption: reponse.selectedOption },
        ),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.quiz.stats() }),
  });
}

export function useMesStatsQuiz() {
  const role = useRole();
  return useQuery({
    queryKey: keys.quiz.stats(),
    queryFn: async () =>
      quizStatsSchema.parse(
        await api.get<unknown>("/api/quiz/attempts/my-stats"),
      ),
    enabled: role === "pilgrim",
  });
}

/** Proposition d'une question (guide, administrateur — ticket #81). */
export function useProposerQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (question: {
      riteSheetId: string;
      question: string;
      options: string[];
      correctOption: number;
      explanation?: string;
    }) =>
      quizQuestionAdminSchema.parse(
        await api.post<unknown>("/api/quiz/questions", question),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.quiz.pending() }),
  });
}

/** File de validation de l'administrateur. */
export function useQuestionsEnAttente() {
  const role = useRole();
  return useQuery({
    queryKey: keys.quiz.pending(),
    queryFn: async () =>
      z
        .array(quizQuestionAdminSchema)
        .parse(await api.get<unknown>("/api/quiz/questions/pending")),
    enabled: role === "admin",
  });
}

export function useValiderQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.patch<unknown>(`/api/quiz/questions/${enc(id)}/validate`),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: keys.quiz.all }),
  });
}

export function useRefuserQuestion() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      api.delete<unknown>(`/api/quiz/questions/${enc(id)}`),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.quiz.pending() }),
  });
}
