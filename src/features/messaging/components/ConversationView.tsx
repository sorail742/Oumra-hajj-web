"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import {
  useConversation,
  useMarquerLu,
  useMessages,
  useSendMessage,
} from "../api/use-messaging";
import type { MessagingChannel } from "../api/schemas";
import { ChatThread } from "@/components/shared/ChatThread";
import { useUserId } from "@/lib/auth/role-context";

/** Voir ADR-0004 : rafraîchissement périodique (`useMessages`), pas de WebSocket. */
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
  const messages = useMessages(conversationId);
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
