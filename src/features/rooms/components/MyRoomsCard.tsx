"use client";

import { useTranslations } from "next-intl";
import { BedDouble } from "lucide-react";
import { useMesChambres } from "../api/use-rooms";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

/** Hébergement du pèlerin (idée #40) : hôtel, type et numéro de chambre. */
export function MyRoomsCard() {
  const t = useTranslations("rooms.mine");
  const tt = useTranslations("rooms.types");
  const query = useMesChambres();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-32 w-full" />}
      empty={
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      }
    >
      {(chambres) => (
        <ul className="grid gap-4 sm:grid-cols-2">
          {chambres.map((c) => (
            <li
              key={`${c.hotelName}-${c.roomNumber}-${c.startDate ?? ""}`}
              className="bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)"
            >
              <div className="flex items-start gap-3">
                <span className="bg-primary-subtle text-primary inline-flex size-10 shrink-0 items-center justify-center rounded-md">
                  <BedDouble aria-hidden className="size-5" />
                </span>
                <div className="min-w-0">
                  <p className="font-semibold">{c.hotelName}</p>
                  <p className="text-muted-foreground text-sm">
                    {c.city} · {c.packageTitle}
                  </p>
                </div>
              </div>
              <p className="text-2xl font-semibold">
                {t("room", { number: c.roomNumber })}
              </p>
              <p className="text-muted-foreground text-sm">
                {tt(c.roomType)}
                {c.startDate && c.endDate
                  ? ` · ${t("dates", {
                      from: formatDate(c.startDate),
                      to: formatDate(c.endDate),
                    })}`
                  : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </AsyncBoundary>
  );
}
