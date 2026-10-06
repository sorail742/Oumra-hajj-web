"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";

/**
 * Discussion de groupe pré-départ (ticket #84) — `CommunityMessageShape`
 * du backend (`GET`/`POST /community/groups/:groupId/messages`). REST et
 * rafraîchissement périodique (ADR-0004) : le temps réel attend la
 * décision de l'ADR proposé sur le sujet (ticket #86).
 */
export const communityMessageSchema = z.object({
  id: z.string(),
  groupId: z.string(),
  senderId: z.string(),
  senderName: z.string().optional(),
  content: z.string(),
  clientSentAt: z.string(),
  createdAt: z.string(),
});

const INTERVALLE_RAFRAICHISSEMENT_MS = 10_000;

function chemin(groupId: string) {
  return `/api/community/groups/${encodeURIComponent(groupId)}/messages`;
}

export function useMessagesGroupe(groupId: string) {
  return useQuery({
    queryKey: keys.community.messages(groupId),
    queryFn: async () =>
      z
        .array(communityMessageSchema)
        .parse(await api.get<unknown>(chemin(groupId))),
    refetchInterval: INTERVALLE_RAFRAICHISSEMENT_MS,
  });
}

export function useEcrireAuGroupe(groupId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (content: string) =>
      communityMessageSchema.parse(
        await api.post<unknown>(chemin(groupId), {
          content,
          clientSentAt: new Date().toISOString(),
        }),
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({
        queryKey: keys.community.messages(groupId),
      }),
  });
}
