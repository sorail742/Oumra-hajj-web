import { z } from "zod";

/**
 * Vérifié directement contre le code source du backend
 * (`Oumra-hadj-project/src/types/messaging.types.ts`, `ConversationShape` /
 * `MessageShape`, lu le 2026-09-17). Voir ADR-0004 : messagerie en REST,
 * pas de WebSocket pour l'instant.
 */
export const messagingChannelSchema = z.enum(["agency", "guide"]);
export type MessagingChannel = z.infer<typeof messagingChannelSchema>;

export const conversationSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  channel: messagingChannelSchema,
});

export type Conversation = z.infer<typeof conversationSchema>;

export const messageSchema = z.object({
  id: z.string(),
  conversationId: z.string(),
  senderId: z.string(),
  content: z.string(),
  clientSentAt: z.string(),
  readAt: z.string().optional(),
  createdAt: z.string(),
});

export type Message = z.infer<typeof messageSchema>;

/**
 * Entrée de la boîte de réception — `InboxConversationShape` du backend
 * (`GET /messaging/conversations`, ticket #67).
 */
export const inboxConversationSchema = z.object({
  id: z.string(),
  bookingId: z.string(),
  channel: messagingChannelSchema,
  counterpartName: z.string(),
  packageTitle: z.string(),
  lastMessage: z.object({
    content: z.string(),
    senderId: z.string(),
    createdAt: z.string(),
  }),
  unreadCount: z.number().int().nonnegative(),
});

export type InboxConversation = z.infer<typeof inboxConversationSchema>;
