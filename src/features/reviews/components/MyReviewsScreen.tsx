"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMyReviews } from "../api/use-reviews";
import type { Review } from "../api/schemas";
import { RatingStars } from "./RatingStars";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export function MyReviewsScreen() {
  const t = useTranslations("reviews");
  const role = useRole();
  const query = useMyReviews();

  const columns: ColumnDef<Review>[] = useMemo(
    () => [
      {
        accessorKey: "bookingId",
        header: t("columnBooking"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.bookingId}</span>
        ),
      },
      {
        accessorKey: "rating",
        header: t("columnRating"),
        cell: ({ row }) => <RatingStars rating={row.original.rating} />,
      },
      { accessorKey: "comment", header: t("columnComment") },
      {
        accessorKey: "createdAt",
        header: t("columnDate"),
        cell: ({ row }) => <RelativeTime iso={row.original.createdAt} />,
      },
    ],
    [t],
  );

  if (role !== "pilgrim") {
    return <EmptyState title={t("roleUnsupportedTitle")} />;
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<TableSkeleton rows={4} />}
      empty={
        <EmptyState
          title={t("myReviewsEmptyTitle")}
          description={t("myReviewsEmptyDescription")}
        />
      }
    >
      {(reviews) => (
        <DataTable
          data={reviews}
          columns={columns}
          getRowId={(r) => r.id}
          renderCard={(r) => (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-center justify-between">
                <RatingStars rating={r.rating} />
                <RelativeTime iso={r.createdAt} />
              </div>
              {r.comment ? <p className="text-sm">{r.comment}</p> : null}
            </div>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
