"use client";

import { useTranslations } from "next-intl";
import { useMembresFideles } from "../api/use-loyalty";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate } from "@/lib/format";

/** Pèlerins ayant voyagé avec l'agence (idée #47) : nom et voyages, rien de plus. */
export function LoyaltyMembersList() {
  const t = useTranslations("loyalty.members");
  const query = useMembresFideles();

  return (
    <section className="space-y-2">
      <h2 className="font-semibold">{t("title")}</h2>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(membres) => (
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("pilgrim")}</TableHead>
                  <TableHead className="text-right">{t("trips")}</TableHead>
                  <TableHead>{t("tier")}</TableHead>
                  <TableHead>{t("lastTrip")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {membres.map((m) => (
                  <TableRow key={m.pilgrimId}>
                    <TableCell className="font-medium">
                      {m.pilgrimName}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {m.trips}
                    </TableCell>
                    <TableCell>{m.tier?.label ?? "—"}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatDate(m.lastTripEnd)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </AsyncBoundary>
    </section>
  );
}
