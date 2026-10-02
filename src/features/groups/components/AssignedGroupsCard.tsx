"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { formatDate } from "@/lib/format";
import { useGroups } from "../api/use-groups";
import { prochaineEtapeItineraire } from "../lib/dashboard";

/** Guide : groupes assignés et prochaine étape de chacun (ticket #70). */
export function AssignedGroupsCard() {
  const t = useTranslations("dashboard");
  const query = useGroups();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(groupes) => {
        const maintenant = new Date();
        return (
          <StatCard
            title={t("assignedGroupsTitle")}
            value={groupes.length}
            href="/groups"
            linkLabel={t("seeGroups")}
          >
            {groupes.length === 0 ? (
              t("assignedGroupsNone")
            ) : (
              <ul className="space-y-2">
                {groupes.map((g) => {
                  const etape = prochaineEtapeItineraire(g, maintenant);
                  return (
                    <li key={g.id}>
                      <Link
                        href={`/groups/${g.id}`}
                        className="font-medium hover:underline"
                      >
                        {g.title}
                      </Link>
                      <div className="text-muted-foreground">
                        {etape
                          ? t("nextItineraryStep", {
                              label: etape.label,
                              date: formatDate(etape.date),
                            })
                          : t("noUpcomingStep")}
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
