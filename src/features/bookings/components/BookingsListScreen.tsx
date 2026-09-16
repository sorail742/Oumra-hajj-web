"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useBookings } from "../api/use-bookings";
import type { Booking } from "../api/schemas";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export function BookingsListScreen() {
  const t = useTranslations("bookings");
  const role = useRole();
  const query = useBookings();

  const columns: ColumnDef<Booking>[] = useMemo(
    () => [
      {
        accessorKey: "id",
        header: t("columnPackage"),
        cell: ({ row }) => (
          <Link
            href={`/bookings/${row.original.id}`}
            className="font-mono text-xs hover:underline"
          >
            {row.original.id}
          </Link>
        ),
      },
      {
        accessorKey: "status",
        header: t("columnStatus"),
        cell: ({ row }) => (
          <StatusBadge kind="booking" value={row.original.status} />
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("columnCreated"),
        cell: ({ row }) =>
          row.original.createdAt ? (
            <RelativeTime iso={row.original.createdAt} />
          ) : null,
      },
    ],
    [t],
  );

  if (role !== "pilgrim" && role !== "agency") {
    return <EmptyState title={t("roleUnsupportedTitle")} />;
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<TableSkeleton rows={8} />}
      empty={
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      }
    >
      {(bookings) => (
        <DataTable
          data={bookings}
          columns={columns}
          getRowId={(b) => b.id}
          renderCard={(b) => (
            <Link
              href={`/bookings/${b.id}`}
              className="block rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs">{b.id}</span>
                <StatusBadge kind="booking" value={b.status} />
              </div>
              {b.createdAt ? (
                <div className="text-muted-foreground mt-1 text-xs">
                  <RelativeTime iso={b.createdAt} />
                </div>
              ) : null}
            </Link>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
