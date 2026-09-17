"use client";

import { useTranslations } from "next-intl";
import { useRiteSheets } from "../api/use-rites";
import { RiteSheetCard } from "./RiteSheetCard";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";

export function RiteSheetsScreen() {
  const t = useTranslations("rites");
  const query = useRiteSheets();

  return (
    <AsyncBoundary
      query={query}
      skeleton={
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-32 w-full" />
          ))}
        </div>
      }
      empty={<EmptyState title={t("emptyTitle")} />}
    >
      {(sheets) => (
        <div className="grid gap-4 sm:grid-cols-2">
          {sheets.map((sheet) => (
            <RiteSheetCard key={sheet.id} sheet={sheet} />
          ))}
        </div>
      )}
    </AsyncBoundary>
  );
}
