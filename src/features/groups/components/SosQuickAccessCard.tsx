"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatCardSkeleton } from "@/components/shared/StatCard";
import { useGroups } from "../api/use-groups";
import type { Group } from "../api/schemas";
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
      {(groupes) => (
        <StatCard title={t("sosTitle")}>
          <ContenuSos groupes={groupes} />
        </StatCard>
      )}
    </AsyncBoundary>
  );
}

/** Aucun groupe, un seul (bouton direct) ou plusieurs (liens vers chacun). */
function ContenuSos({ groupes }: Readonly<{ groupes: readonly Group[] }>) {
  const t = useTranslations("dashboard");
  const [seul] = groupes;
  if (groupes.length === 0) {
    return <>{t("sosNoGroup")}</>;
  }
  if (groupes.length === 1 && seul) {
    return (
      <div className="space-y-2">
        <p className="text-muted-foreground">
          {t("sosDescription", { group: seul.title })}
        </p>
        <SosButton groupId={seul.id} />
      </div>
    );
  }
  return (
    <ul className="space-y-1">
      {groupes.map((g) => (
        <li key={g.id}>
          <Link href={`/groups/${g.id}`} className="hover:underline">
            {g.title}
          </Link>
        </li>
      ))}
    </ul>
  );
}
