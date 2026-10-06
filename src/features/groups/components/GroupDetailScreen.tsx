"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { useGroup } from "../api/use-groups";
import type { Group } from "../api/schemas";
import { ItineraryStepForm } from "./ItineraryStepForm";
import { LocationSharingCard } from "./LocationSharingCard";
import { MemberLocations } from "./MemberLocations";
import { SosButton } from "./SosButton";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { Can } from "@/components/shared/Can";
import { EmptyState } from "@/components/shared/EmptyState";
import { formatDate } from "@/lib/format";

/**
 * `guideAction` et `apres` : emplacements fournis par la page pour composer
 * d'autres domaines (guides de l'agence #64, discussion #84) sans import
 * entre features (règle 2).
 */
export function GroupDetailScreen({
  id,
  guideAction,
  apres,
}: Readonly<{
  id: string;
  guideAction?: (group: Group) => ReactNode;
  /** Section composée par la page sous le détail (discussion, #84). */
  apres?: (group: Group) => ReactNode;
}>) {
  const t = useTranslations("groups");
  const query = useGroup(id);

  return (
    <AsyncBoundary
      query={query}
      skeleton={<DetailSkeleton />}
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
              {guideAction ? (
                <Can role="agency">{guideAction(group)}</Can>
              ) : null}
              <Can role="pilgrim">
                <SosButton groupId={group.id} />
              </Can>
            </div>

            <div className="space-y-4">
              <h2 className="text-lg font-medium">{t("itineraryTitle")}</h2>
              {itineraire.length === 0 ? (
                <EmptyState title={t("itineraryEmptyTitle")} />
              ) : (
                <ol className="space-y-3">
                  {itineraire.map((etape) => (
                    <li
                      key={`${etape.date}-${etape.label}`}
                      className="flex items-baseline gap-3 text-sm"
                    >
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
              <Can role="agency">
                <ItineraryStepForm groupId={group.id} />
              </Can>
            </div>
            <Can role={["pilgrim", "guide"]}>
              <LocationSharingCard groupId={group.id} />
            </Can>
            <MemberLocations group={group} />
            {apres?.(group)}
          </div>
        );
      }}
    </AsyncBoundary>
  );
}
