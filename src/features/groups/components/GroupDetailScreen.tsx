"use client";

import { useTranslations } from "next-intl";
import { useGroup } from "../api/use-groups";
import { SosButton } from "./SosButton";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Can } from "@/components/shared/Can";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

export function GroupDetailScreen({ id }: { id: string }) {
  const t = useTranslations("groups");
  const query = useGroup(id);

  return (
    <AsyncBoundary
      query={query}
      skeleton={
        <div className="space-y-3">
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-32 w-full" />
        </div>
      }
      isEmpty={() => false}
    >
      {(group) => {
        const itineraire = [...group.itinerary].sort((a, b) =>
          a.date.localeCompare(b.date),
        );

        return (
          <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
                <span className="font-medium">{group.title}</span>
                <span className="text-muted-foreground">
                  {t("membersCount", { count: group.memberIds.length })}
                </span>
                <span className="text-muted-foreground">
                  {group.guideId ? t("guideAssigned") : t("guideUnassigned")}
                </span>
              </div>
              <Can role="pilgrim">
                <SosButton groupId={group.id} />
              </Can>
            </div>

            <div>
              <h2 className="mb-3 text-lg font-medium">
                {t("itineraryTitle")}
              </h2>
              {itineraire.length === 0 ? (
                <EmptyState title={t("itineraryEmptyTitle")} />
              ) : (
                <ol className="space-y-3">
                  {itineraire.map((etape, i) => (
                    <li key={i} className="flex items-baseline gap-3 text-sm">
                      <span className="font-mono text-xs whitespace-nowrap">
                        {formatDate(etape.date)}
                      </span>
                      <span>{etape.label}</span>
                      {etape.location ? (
                        <span className="text-muted-foreground text-xs">
                          — {etape.location}
                        </span>
                      ) : null}
                    </li>
                  ))}
                </ol>
              )}
            </div>
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
