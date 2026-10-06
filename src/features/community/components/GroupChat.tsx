"use client";

import { useTranslations } from "next-intl";
import { useEcrireAuGroupe, useMessagesGroupe } from "../api/use-community";
import { ChatThread } from "@/components/shared/ChatThread";
import { useUserId } from "@/lib/auth/role-context";

/**
 * Discussion de groupe pré-départ (ticket #84) : membres, guide, agence.
 * Le backend refuse toute personne extérieure au groupe.
 */
export function GroupChat({ groupId }: Readonly<{ groupId: string }>) {
  const t = useTranslations("community");
  const userId = useUserId();
  const messages = useMessagesGroupe(groupId);
  const ecrire = useEcrireAuGroupe(groupId);

  return (
    <section className="space-y-3">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <ChatThread
        query={messages}
        userId={userId}
        emptyTitle={t("emptyTitle")}
        emptyDescription={t("emptyBody")}
        showSenderNames
        onSend={(contenu) => ecrire.mutateAsync(contenu)}
      />
    </section>
  );
}
