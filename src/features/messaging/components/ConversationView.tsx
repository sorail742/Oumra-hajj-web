"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import {
  useConversation,
  useMarquerLu,
  useMessages,
  useSendMessage,
} from "../api/use-messaging";
import type { MessagingChannel } from "../api/schemas";
import { ChatThread } from "@/components/shared/ChatThread";
import { keys } from "@/lib/api/query-keys";
import { useUserId } from "@/lib/auth/role-context";
import { useTempsReel } from "@/lib/realtime/use-temps-reel";

/**
 * Fil d'une réservation : lu et écrit en REST (ADR-0004) ; un nouveau
 * message signalé en temps réel (ADR-0006) relance simplement la lecture.
 */
export function ConversationView({
  bookingId,
  channel,
}: {
  bookingId: string;
  channel: MessagingChannel;
}) {
  const t = useTranslations("messaging");
  const userId = useUserId();
  const conversation = useConversation(bookingId, channel);
  const conversationId = conversation.data?.id;
  const queryClient = useQueryClient();
  const { connecte } = useTempsReel({
    namespace: "messaging",
    rejoindre: conversationId
      ? { evenement: "conversation:join", id: conversationId }
      : undefined,
    evenement: "message:new",
    onEvenement: () => {
      void queryClient.invalidateQueries({ queryKey: keys.messaging.all });
    },
  });
  const messages = useMessages(conversationId, connecte);
  const envoyerMessage = useSendMessage(conversationId);

  // Accusé de lecture dès qu'un message reçu non lu est affiché (#67).
  const { mutate: marquer } = useMarquerLu();
  const aDesNonLus =
    messages.data?.some((m) => m.senderId !== userId && !m.readAt) ?? false;
  useEffect(() => {
    if (conversationId && userId && aDesNonLus) {
      marquer(conversationId);
    }
  }, [conversationId, userId, aDesNonLus, marquer]);

  return (
    <ChatThread
      query={messages}
      userId={userId}
      emptyTitle={t("emptyTitle")}
      emptyDescription={t("emptyDescription")}
      disabled={!conversationId}
      onSend={(contenu) => envoyerMessage.mutateAsync(contenu)}
    />
  );
}
