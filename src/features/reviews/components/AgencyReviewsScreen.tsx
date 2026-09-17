"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useAgencyReviews, useAgencyTrustScore } from "../api/use-reviews";
import type { Review } from "../api/schemas";
import { AgencyTrustCard } from "./AgencyTrustCard";
import { RatingStars } from "./RatingStars";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Skeleton } from "@/components/ui/skeleton";

/** Public — voir `src/proxy.ts` (`GET /reviews/agency/:id` et `.../trust-score` sont `@Public()`). */
export function AgencyReviewsScreen({ agencyId }: { agencyId: string }) {
  const t = useTranslations("reviews");
  const trustScore = useAgencyTrustScore(agencyId);
  const reviews = useAgencyReviews(agencyId);

  const columns: ColumnDef<Review>[] = useMemo(
    () => [
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

  return (
    <div className="space-y-6">
      <AsyncBoundary
        query={trustScore}
        skeleton={<Skeleton className="h-32 w-full" />}
        isEmpty={() => false}
      >
        {(score) => <AgencyTrustCard trustScore={score} />}
      </AsyncBoundary>

      <div>
        <h2 className="mb-3 text-lg font-medium">{t("agencyReviewsTitle")}</h2>
        <AsyncBoundary
          query={reviews}
          skeleton={<TableSkeleton rows={4} />}
          empty={<EmptyState title={t("agencyReviewsEmptyTitle")} />}
        >
          {(donnees) => (
            <DataTable
              data={donnees}
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
      </div>
    </div>
  );
}
