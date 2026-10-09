"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, CalendarOff, Trash2, Users } from "lucide-react";
import type { GuideSchedule } from "../api/use-guide-planning";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Entrées du planning d'un guide, dans l'ordre chronologique ; celles qui
 * se chevauchent sont marquées, avec les jours en conflit.
 */
export function ScheduleList({
  planning,
  onDelete,
}: Readonly<{
  planning: GuideSchedule;
  onDelete?: (unavailabilityId: string) => void;
}>) {
  const t = useTranslations("guidePlanning");
  const enConflit = new Set(
    planning.conflicts.flatMap((c) => [c.firstId, c.secondId]),
  );

  if (planning.entries.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("free")}</p>;
  }

  return (
    <div className="space-y-3">
      {planning.conflicts.map((c) => (
        <p
          key={`${c.firstId}-${c.secondId}`}
          role="alert"
          className="bg-state-danger-bg text-state-danger flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium"
        >
          <AlertTriangle aria-hidden className="size-4 shrink-0" />
          {t("conflict", {
            first:
              planning.entries.find((e) => e.id === c.firstId)?.label ?? "",
            second:
              planning.entries.find((e) => e.id === c.secondId)?.label ?? "",
            from: formatDate(c.startDate),
            to: formatDate(c.endDate),
          })}
        </p>
      ))}
      <ol className="space-y-2">
        {planning.entries.map((e) => {
          const Icone = e.kind === "group" ? Users : CalendarOff;
          return (
            <li
              key={e.id}
              className={cn(
                "flex items-center gap-3 rounded-md border px-3 py-2 text-sm",
                enConflit.has(e.id) && "border-state-danger",
              )}
            >
              <span
                className={cn(
                  "inline-flex size-8 shrink-0 items-center justify-center rounded-md",
                  e.kind === "group"
                    ? "bg-primary-subtle text-primary"
                    : "bg-muted text-muted-foreground",
                )}
              >
                <Icone aria-hidden className="size-4" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate font-medium">{e.label}</p>
                <p className="text-muted-foreground text-xs">
                  {e.kind === "group" ? e.packageTitle : t("unavailable")} ·{" "}
                  {t("period", {
                    from: formatDate(e.startDate),
                    to: formatDate(e.endDate),
                  })}
                </p>
              </div>
              {e.kind === "unavailability" && onDelete && (
                <Button
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("deleteUnavailability", { label: e.label })}
                  onClick={() => onDelete(e.id)}
                >
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              )}
            </li>
          );
        })}
      </ol>
    </div>
  );
}
