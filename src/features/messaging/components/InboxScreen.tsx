"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { useInbox } from "../api/use-messaging";
import type { InboxConversation } from "../api/schemas";
import { ConversationView } from "./ConversationView";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserId } from "@/lib/auth/role-context";
import { cn } from "@/lib/utils";

/**
 * Boîte de réception (ticket #67) : fils où au moins un message a été
 * échangé, le plus récent en premier. Le fil ouvert vit dans l'URL
 * (`?c=<id>`, règle 8) ; sur mobile, la liste laisse place au fil.
 */
function EntreeFil({
  fil,
  actif,
  onOuvrir,
}: Readonly<{
  fil: InboxConversation;
  actif: boolean;
  onOuvrir: () => void;
}>) {
  const t = useTranslations("messaging.inbox");
  const userId = useUserId();
  const deMoi = fil.lastMessage.senderId === userId;

  return (
    <li>
      <button
        type="button"
        onClick={onOuvrir}
        aria-current={actif ? "true" : undefined}
        className={cn(
          "hover:bg-muted flex w-full flex-col gap-1 px-4 py-3 text-left",
          actif && "bg-muted",
        )}
      >
        <span className="flex items-center justify-between gap-2">
          <span
            className={cn(
              "truncate text-sm",
              fil.unreadCount > 0 ? "font-semibold" : "font-medium",
            )}
          >
            {fil.counterpartName}
          </span>
          <span className="text-muted-foreground shrink-0 text-xs">
            <RelativeTime iso={fil.lastMessage.createdAt} />
          </span>
        </span>
        <span className="text-muted-foreground flex items-center gap-2 text-xs">
          <span className="truncate">{fil.packageTitle}</span>
          <span aria-hidden>·</span>
          <span className="shrink-0">
            {fil.channel === "agency" ? t("channelAgency") : t("channelGuide")}
          </span>
        </span>
        <span className="flex items-center justify-between gap-2">
          <span className="text-muted-foreground truncate text-sm">
            {deMoi
              ? t("fromMe", { content: fil.lastMessage.content })
              : fil.lastMessage.content}
          </span>
          {fil.unreadCount > 0 && (
            <Badge aria-label={t("unread", { count: fil.unreadCount })}>
              {fil.unreadCount}
            </Badge>
          )}
        </span>
      </button>
    </li>
  );
}

export function InboxScreen() {
  const t = useTranslations("messaging.inbox");
  const router = useRouter();
  const params = useSearchParams();
  const query = useInbox();
  const ouvertId = params.get("c");

  function ouvrir(id: string | null) {
    const suivant = new URLSearchParams(params.toString());
    if (id) {
      suivant.set("c", id);
    } else {
      suivant.delete("c");
    }
    const recherche = suivant.toString();
    router.replace(recherche ? `?${recherche}` : "?", { scroll: false });
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-64 w-full" />}
      empty={
        <EmptyState title={t("emptyTitle")} description={t("emptyBody")} />
      }
    >
      {(fils) => {
        const ouvert = fils.find((f) => f.id === ouvertId);
        return (
          <div className="grid gap-4 md:grid-cols-[minmax(0,20rem)_1fr]">
            <ul
              aria-label={t("listLabel")}
              className={cn(
                "bg-card divide-y self-start rounded-xl border",
                ouvert && "hidden md:block",
              )}
            >
              {fils.map((fil) => (
                <EntreeFil
                  key={fil.id}
                  fil={fil}
                  actif={fil.id === ouvert?.id}
                  onOuvrir={() => ouvrir(fil.id)}
                />
              ))}
            </ul>
            {ouvert ? (
              <section
                aria-label={ouvert.counterpartName}
                className="bg-card space-y-3 rounded-xl border p-4"
              >
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="md:hidden"
                    onClick={() => ouvrir(null)}
                    aria-label={t("back")}
                  >
                    <ArrowLeft aria-hidden className="size-4" />
                  </Button>
                  <div>
                    <h2 className="text-base font-semibold">
                      {ouvert.counterpartName}
                    </h2>
                    <p className="text-muted-foreground text-xs">
                      {ouvert.packageTitle}
                    </p>
                  </div>
                </div>
                <ConversationView
                  bookingId={ouvert.bookingId}
                  channel={ouvert.channel}
                />
              </section>
            ) : (
              <p className="text-muted-foreground hidden self-center text-center text-sm md:block">
                {t("pick")}
              </p>
            )}
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
