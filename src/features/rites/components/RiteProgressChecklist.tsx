"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { useTranslations } from "next-intl";
import { useMyRiteProgress, useRiteSheets } from "../api/use-rites";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

/**
 * Compteurs tawaf/sai, rites complétés — voir `docs/design-system.md` §7 :
 * toujours accompagné de `ReligiousContentNotice` tant que la fiche source
 * n'est pas validée. Un `riteKey` sans fiche correspondante dans la liste
 * publique (encore en modération, ou clé orpheline) est traité comme
 * **non validé** — jamais supposé validé par défaut.
 */
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
      empty={<EmptyState title={t("progressEmptyTitle")} />}
    >
      {(items) => {
        const parCle = new Map((sheets.data ?? []).map((s) => [s.key, s]));

        return (
          <ul className="space-y-3">
            {items.map((item) => {
              const sheet = parCle.get(item.riteKey);
              return (
                <li key={item.id} className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-center gap-2">
                    {item.completed ? (
                      <CheckCircle2
                        className="text-state-success size-5 shrink-0"
                        aria-hidden
                      />
                    ) : (
                      <Circle
                        className="text-muted-foreground size-5 shrink-0"
                        aria-hidden
                      />
                    )}
                    <span className="text-sm font-medium">
                      {sheet?.title ?? item.riteKey}
                    </span>
                  </div>
                  <div className="text-muted-foreground flex gap-4 font-mono text-xs">
                    <span>
                      {t("columnTawaf")} : {item.tawafCount}
                    </span>
                    <span>
                      {t("columnSai")} : {item.saiCount}
                    </span>
                  </div>
                  <ReligiousContentNotice
                    validated={sheet?.isValidated ?? false}
                  />
                </li>
              );
            })}
          </ul>
        );
      }}
    </AsyncBoundary>
  );
}
