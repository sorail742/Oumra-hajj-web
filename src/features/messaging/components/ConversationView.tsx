"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useConversation,
  useMessages,
  useSendMessage,
} from "../api/use-messaging";
import type { MessagingChannel } from "../api/schemas";
import { useUserId } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { cn } from "@/lib/utils";

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
  const messages = useMessages(conversation.data?.id);
  const envoyerMessage = useSendMessage(conversation.data?.id);
  const [texte, setTexte] = useState("");
  const finListe = useRef<HTMLDivElement>(null);

  useEffect(() => {
    finListe.current?.scrollIntoView({ block: "end" });
  }, [messages.data?.length]);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    const contenu = texte.trim();
    if (!contenu) {
      return;
    }
    setTexte("");
    try {
      await envoyerMessage.mutateAsync(contenu);
    } catch {
      toast.error(t("sendError"));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
        <AsyncBoundary
          query={messages}
          skeleton={<p className="text-muted-foreground text-sm">…</p>}
          empty={
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          }
        >
          {(items) => (
            <>
              {items.map((message) => {
                const estMoi =
                  userId !== undefined && message.senderId === userId;
                return (
                  <div
                    key={message.id}
                    className={cn(
                      "flex",
                      estMoi ? "justify-end" : "justify-start",
                    )}
                  >
                    <div
                      className={cn(
                        "max-w-[80%] rounded-lg px-3 py-2 text-sm",
                        estMoi
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted",
                      )}
                    >
                      <p>{message.content}</p>
                      <p
                        className={cn(
                          "mt-1 text-2xs",
                          estMoi
                            ? "text-primary-foreground/70"
                            : "text-muted-foreground",
                        )}
                      >
                        <RelativeTime iso={message.createdAt} />
                      </p>
                    </div>
                  </div>
                );
              })}
              <div ref={finListe} />
            </>
          )}
        </AsyncBoundary>
      </div>

      <form onSubmit={envoyer} className="flex gap-2">
        <Input
          value={texte}
          onChange={(e) => setTexte(e.target.value)}
          placeholder={t("placeholder")}
          disabled={!conversation.data}
        />
        <Button type="submit" disabled={!conversation.data || !texte.trim()}>
          {t("send")}
        </Button>
      </form>
    </div>
  );
}
