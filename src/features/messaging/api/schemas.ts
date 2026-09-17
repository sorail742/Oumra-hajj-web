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
