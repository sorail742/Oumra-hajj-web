"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { useGroups } from "../api/use-groups";
import { SosButton } from "./SosButton";

/**
 * Pèlerin : accès rapide au SOS (ticket #70). Le bouton est le même que
 * sur la fiche du groupe — pression maintenue, voir `SosButton` — : un
 * seul groupe le rend directement, plusieurs renvoient vers chaque fiche.
 */
export function SosQuickAccessCard() {
  const t = useTranslations("dashboard");
  const query = useGroups();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<StatCardSkeleton />}
      isEmpty={() => false}
    >
      {(groupes) => {
        const [seul] = groupes;
        return (
          <StatCard title={t("sosTitle")}>
            {groupes.length === 0 ? (
              t("sosNoGroup")
            ) : groupes.length === 1 && seul ? (
              <div className="space-y-2">
                <p className="text-muted-foreground">
                  {t("sosDescription", { group: seul.title })}
                </p>
                <SosButton groupId={seul.id} />
              </div>
            ) : (
              <ul className="space-y-1">
                {groupes.map((g) => (
                  <li key={g.id}>
                    <Link href={`/groups/${g.id}`} className="hover:underline">
                      {g.title}
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </StatCard>
        );
      }}
    </AsyncBoundary>
  );
}
