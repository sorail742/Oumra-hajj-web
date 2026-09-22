"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  useAgencies,
  useApproveAgency,
  useRejectAgency,
} from "../api/use-agencies";
import type { Agency } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";

export function AgenciesListScreen() {
  const t = useTranslations("agencies");
  const query = useAgencies();
  const approveMutation = useApproveAgency();
  const rejectMutation = useRejectAgency();

  const handleApprove = (id: string) => {
    if (window.confirm(t("actions.confirmApprove"))) {
      approveMutation.mutate(id);
    }
  };

  const handleReject = (id: string) => {
    const reason = window.prompt(t("actions.promptRejectReason"));
    if (reason) {
      rejectMutation.mutate({ id, reason });
    }
  };

  const columns: ColumnDef<Agency>[] = useMemo(
    () => [
      { accessorKey: "legalName", header: t("columns.legalName") },
      { accessorKey: "contactEmail", header: t("columns.contactEmail") },
      { accessorKey: "contactPhone", header: t("columns.contactPhone") },
      {
        accessorKey: "status",
        header: t("columns.status"),
        cell: ({ row }) => (
          <StatusBadge kind="agency" value={row.original.status} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => {
          const isPending = row.original.status === "pending";
          if (!isPending) return null;
          return (
            <div className="flex gap-2 justify-end">
              <Button
                variant="outline"
                size="sm"
                className="text-success hover:text-success"
                onClick={() => handleApprove(row.original.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {t("actions.approve")}
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => handleReject(row.original.id)}
                disabled={approveMutation.isPending || rejectMutation.isPending}
              >
                {t("actions.reject")}
              </Button>
            </div>
          );
        },
      },
    ],
    [t, approveMutation.isPending, rejectMutation.isPending],
  );

  return (
    <div className="space-y-4">
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
        {(agencies) => (
          <DataTable
            data={agencies}
            columns={columns}
            getRowId={(a) => a.id}
            renderCard={(a) => (
              <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span className="text-sm font-medium">{a.legalName}</span>
                  <StatusBadge kind="agency" value={a.status} />
                </div>
                <div className="text-muted-foreground text-xs space-y-1">
                  <div>{a.contactEmail}</div>
                  <div>{a.contactPhone}</div>
                </div>
                {a.status === "pending" && (
                  <div className="flex gap-2 pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-success w-full"
                      onClick={() => handleApprove(a.id)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      {t("actions.approve")}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-destructive w-full"
                      onClick={() => handleReject(a.id)}
                      disabled={
                        approveMutation.isPending || rejectMutation.isPending
                      }
                    >
                      {t("actions.reject")}
                    </Button>
                  </div>
                )}
              </div>
            )}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}
