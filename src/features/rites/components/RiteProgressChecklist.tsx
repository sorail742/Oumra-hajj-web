"use client";

import { useTranslations } from "next-intl";
import { useMyRiteProgress, useRiteSheets } from "../api/use-rites";
import type { RiteProgress, RiteSheet } from "../api/schemas";
import { RiteProgressItem, type EtatRite } from "./RiteProgressItem";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

/**
 * Progression du pèlerin, interactive (ticket #79) : chaque fiche publiée
 * peut être commencée, plus les rites déjà suivis sans fiche publique
 * (encore en modération, ou clé orpheline). Ces derniers sont traités
 * comme **non validés** — jamais supposés validés par défaut.
 */
function fusionner(
  fiches: readonly RiteSheet[],
  progression: readonly RiteProgress[],
): EtatRite[] {
  const parCle = new Map(progression.map((p) => [p.riteKey, p]));
  const etats: EtatRite[] = [...fiches]
    .sort((a, b) => a.order - b.order)
    .map((fiche) => {
      const p = parCle.get(fiche.key);
      parCle.delete(fiche.key);
      return {
        riteKey: fiche.key,
        titre: fiche.title,
        valide: fiche.isValidated,
        completed: p?.completed ?? false,
        tawafCount: p?.tawafCount ?? 0,
        saiCount: p?.saiCount ?? 0,
      };
    });
  for (const p of parCle.values()) {
    etats.push({
      riteKey: p.riteKey,
      titre: p.riteKey,
      valide: false,
      completed: p.completed,
      tawafCount: p.tawafCount,
      saiCount: p.saiCount,
    });
  }
  return etats;
}

export function RiteProgressChecklist() {
  const t = useTranslations("rites");
  const role = useRole();
  const progress = useMyRiteProgress();
  const sheets = useRiteSheets();

  if (role !== "pilgrim") {
    return <EmptyState title={t("progressRoleUnsupportedTitle")} />;
  }

  return (
    <AsyncBoundary
      query={progress}
      skeleton={<TableSkeleton rows={3} />}
      isEmpty={(items) => fusionner(sheets.data ?? [], items).length === 0}
      empty={<EmptyState title={t("progressEmptyTitle")} />}
    >
      {(items) => (
        <ul className="space-y-3">
          {fusionner(sheets.data ?? [], items).map((etat) => (
            <RiteProgressItem key={etat.riteKey} etat={etat} />
          ))}
        </ul>
      )}
    </AsyncBoundary>
  );
}
