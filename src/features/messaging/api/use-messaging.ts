"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import {
  conversationSchema,
  inboxConversationSchema,
  messageSchema,
  type MessagingChannel,
} from "./schemas";

/** `GET /messaging/bookings/:bookingId/conversations/:channel` — crée la conversation si nécessaire côté backend. */
export function useConversation(bookingId: string, channel: MessagingChannel) {
  return useQuery({
    queryKey: keys.messaging.conversation(bookingId, channel),
    queryFn: async () => {
      const donnees = await api.get<unknown>(
        `/api/messaging/bookings/${bookingId}/conversations/${channel}`,
      );
      return conversationSchema.parse(donnees);
    },
  });
}

/**
 * Rafraîchissement périodique, pas de WebSocket — voir ADR-0004. 5 s : un
 * compromis de latence assumé, pas une valeur technique contrainte.
 * `refetchIntervalInBackground` reste à `false` (défaut TanStack Query) :
 * pas de sondage quand l'onglet n'est pas au premier plan.
 */
const INTERVALLE_RAFRAICHISSEMENT_MS = 5_000;

export function useMessages(conversationId: string | undefined) {
  return useQuery({
    queryKey: keys.messaging.messages(conversationId ?? ""),
    queryFn: async () => {
      const donnees = await api.get<unknown>(
        `/api/messaging/conversations/${conversationId}/messages`,
      );
      return z.array(messageSchema).parse(donnees);
    },
    enabled: conversationId !== undefined,
    refetchInterval: INTERVALLE_RAFRAICHISSEMENT_MS,
  });
}

export function useSendMessage(conversationId: string | undefined) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (content: string) => {
      const donnees = await api.post<unknown>(
        `/api/messaging/conversations/${conversationId}/messages`,
        { content, clientSentAt: new Date().toISOString() },
      );
      return messageSchema.parse(donnees);
    },
    onSuccess: () => {
      if (conversationId) {
        void queryClient.invalidateQueries({
          queryKey: keys.messaging.messages(conversationId),
        });
      }
    },
  });
}

/**
 * Boîte de réception (ticket #67) — même principe de sondage que
 * `useMessages`, plus espacé : 30 s suffisent pour repérer un nouveau fil.
 */
const INTERVALLE_BOITE_MS = 30_000;

export function useInbox() {
  return useQuery({
    queryKey: keys.messaging.inbox(),
    queryFn: async () =>
      z
        .array(inboxConversationSchema)
        .parse(await api.get<unknown>("/api/messaging/conversations")),
    refetchInterval: INTERVALLE_BOITE_MS,
  });
}

/** Marque lus les messages reçus d'un fil, puis rafraîchit la boîte. */
export function useMarquerLu() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (conversationId: string) =>
      api.post<unknown>(
        `/api/messaging/conversations/${encodeURIComponent(conversationId)}/read`,
      ),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: keys.messaging.inbox() }),
  });
}
