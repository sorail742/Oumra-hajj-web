"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Gavel } from "lucide-react";
import { useEcrireLitige, useLitige } from "../api/use-disputes";
import { estActif, type Dispute } from "../api/schemas";
import { DisputeActions } from "./DisputeActions";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ChatThread } from "@/components/shared/ChatThread";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { hasRole } from "@/lib/auth/permissions";
import { useRole } from "@/lib/auth/role-context";
import { formatDateHeure } from "@/lib/format";
import { cn } from "@/lib/utils";

const ETAPES = ["dialogue", "arbitration", "closed"] as const;

function etapeCourante(litige: Dispute): number {
  if (!estActif(litige.status)) return 2;
  return litige.status === "escalated" ? 1 : 0;
}

/**
 * Détail d'un litige (idée #62) : où en est la médiation, le fil des
 * échanges (les messages de mon rôle à droite), la décision s'il y en a
 * une, et les actions permises à mon rôle.
 */
export function DisputeDetailScreen({ id }: Readonly<{ id: string }>) {
  const t = useTranslations("disputes");
  const tcat = useTranslations("disputes.categories");
  const tr = useTranslations("nav.roles");
  const role = useRole();
  const query = useLitige(id);
  const ecriture = useEcrireLitige(id);

  return (
    <div className="space-y-6">
      <Link
        href="/disputes"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("back")}
      </Link>
      <AsyncBoundary query={query} skeleton={<DetailSkeleton />}>
        {(litige) => {
          const courante = etapeCourante(litige);
          // L'administration n'écrit qu'une fois saisie (escalade).
          const peutEcrire =
            estActif(litige.status) &&
            (litige.status === "escalated" || !hasRole(role, "admin"));
          const messages = (litige.messages ?? []).map((m) => ({
            id: m.id,
            senderId: m.authorRole,
            senderName: `${m.authorName} · ${tr(m.authorRole)}`,
            content: m.content,
            createdAt: m.createdAt,
          }));
          return (
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
              <div className="space-y-6">
                <section className="bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <h1 className="text-xl font-semibold">{litige.subject}</h1>
                    <StatusBadge kind="dispute" value={litige.status} />
                  </div>
                  <p className="text-muted-foreground text-sm">
                    {tcat(litige.category)} · {litige.packageTitle}
                  </p>
                  <p className="text-muted-foreground text-sm">
                    {t("parties", {
                      pilgrim: litige.pilgrimName,
                      agency: litige.agencyName,
                    })}{" "}
                    · {t("opened", { date: formatDateHeure(litige.createdAt) })}
                  </p>
                </section>

                {litige.decision && (
                  <section className="border-state-success bg-state-success-bg space-y-2 rounded-lg border p-5">
                    <h2 className="text-state-success flex items-center gap-2 font-semibold">
                      <Gavel aria-hidden className="size-4" />
                      {t("decisionTitle")}
                    </h2>
                    <p className="text-sm whitespace-pre-wrap">
                      {litige.decision}
                    </p>
                    {litige.closedAt && (
                      <p className="text-muted-foreground text-xs">
                        {formatDateHeure(litige.closedAt)}
                      </p>
                    )}
                  </section>
                )}

                <section className="space-y-3">
                  <h2 className="font-medium">{t("thread")}</h2>
                  <ChatThread
                    query={{ ...query, data: messages }}
                    userId={role}
                    emptyTitle={t("threadEmpty")}
                    emptyDescription=""
                    disabled={!peutEcrire}
                    showSenderNames
                    onSend={(contenu) => ecriture.mutateAsync(contenu)}
                  />
                  {!peutEcrire && (
                    <p className="text-muted-foreground text-xs">
                      {estActif(litige.status)
                        ? t("adminWaits")
                        : t("closedThread")}
                    </p>
                  )}
                </section>
              </div>

              <aside className="space-y-4">
                <section className="bg-card rounded-lg border p-4 shadow-(--shadow-card)">
                  <h2 className="mb-3 font-medium">{t("progress")}</h2>
                  <ol className="space-y-3">
                    {ETAPES.map((etape, i) => (
                      <li key={etape} className="flex gap-3">
                        <span
                          className={cn(
                            "inline-flex size-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
                            i < courante && "bg-primary-subtle text-primary",
                            i === courante &&
                              "bg-primary text-primary-foreground",
                            i > courante && "bg-muted text-muted-foreground",
                          )}
                        >
                          {i + 1}
                        </span>
                        <div className="space-y-0.5">
                          <p
                            className={cn(
                              "text-sm",
                              i === courante ? "font-semibold" : "",
                            )}
                          >
                            {t(`steps.${etape}.title`)}
                          </p>
                          <p className="text-muted-foreground text-xs">
                            {t(`steps.${etape}.description`)}
                          </p>
                        </div>
                      </li>
                    ))}
                  </ol>
                  <p className="text-muted-foreground mt-4 border-t pt-3 text-sm">
                    {t(`statusHelp.${litige.status}`)}
                  </p>
                </section>
                <DisputeActions litige={litige} />
              </aside>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
