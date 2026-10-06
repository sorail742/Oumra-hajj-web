"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  AsyncBoundary,
  type QueryLike,
} from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

/**
 * Fil de discussion : messages (les miens à droite) et saisie. Partagé par
 * la messagerie réservation (#66, #67) et la discussion de groupe (#84) ;
 * le rafraîchissement est la responsabilité de `query` (ADR-0004).
 */
export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  content: string;
  createdAt: string;
}

const LONGUEUR_MAX = 2000;

export function ChatThread({
  query,
  userId,
  emptyTitle,
  emptyDescription,
  disabled = false,
  showSenderNames = false,
  onSend,
}: Readonly<{
  query: QueryLike<ChatMessage[]>;
  userId: string | undefined;
  emptyTitle: string;
  emptyDescription: string;
  disabled?: boolean;
  showSenderNames?: boolean;
  onSend: (content: string) => Promise<unknown>;
}>) {
  const t = useTranslations("chat");
  const [texte, setTexte] = useState("");
  const finListe = useRef<HTMLDivElement>(null);
  const nombre = query.data?.length;

  useEffect(() => {
    finListe.current?.scrollIntoView({ block: "end" });
  }, [nombre]);

  async function envoyer(e: FormEvent) {
    e.preventDefault();
    const contenu = texte.trim();
    if (!contenu) return;
    setTexte("");
    try {
      await onSend(contenu);
    } catch {
      setTexte(contenu);
      toast.error(t("sendError"));
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="h-64 space-y-2 overflow-y-auto rounded-lg border p-3">
        <AsyncBoundary
          query={query}
          skeleton={<p className="text-muted-foreground text-sm">…</p>}
          empty={
            <EmptyState title={emptyTitle} description={emptyDescription} />
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
                      {showSenderNames && !estMoi && message.senderName && (
                        <p className="mb-0.5 text-xs font-medium">
                          {message.senderName}
                        </p>
                      )}
                      <p className="whitespace-pre-wrap">{message.content}</p>
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
          aria-label={t("placeholder")}
          maxLength={LONGUEUR_MAX}
          disabled={disabled}
        />
        <Button type="submit" disabled={disabled || !texte.trim()}>
          {t("send")}
        </Button>
      </form>
    </div>
  );
}
