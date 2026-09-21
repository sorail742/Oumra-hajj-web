"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useComplianceAlerts } from "../api/use-legal-documents";
import type { LegalDocumentAlert } from "../api/schemas";
import { LegalDocumentAccessButton } from "./LegalDocumentAccessButton";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatDate } from "@/lib/format";

/**
 * Distingue visuellement `expired` (`state-danger`) de `expiring_soon`
 * (`state-warning`) — voir `docs/design-system.md` §7, via le registre de
 * statuts (`config/status-registry.ts`), jamais un mapping local.
 */
export function LegalDocumentComplianceList() {
  const t = useTranslations("agencyCompliance");
  const role = useRole();
  const query = useComplianceAlerts();

  const columns: ColumnDef<LegalDocumentAlert>[] = useMemo(
    () => [
      { accessorKey: "label", header: t("columnDocument") },
      {
        accessorKey: "expiresAt",
        header: t("columnExpiry"),
        cell: ({ row }) => formatDate(row.original.expiresAt),
      },
      {
        accessorKey: "status",
        header: t("columnStatus"),
        cell: ({ row }) => (
          <StatusBadge kind="legalDocument" value={row.original.status} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <LegalDocumentAccessButton documentId={row.original.id} />
        ),
      },
    ],
    [t],
  );

  if (role !== "agency") {
    return <EmptyState title={t("roleUnsupportedTitle")} />;
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<TableSkeleton rows={4} />}
      empty={
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      }
    >
      {(alertes) => (
        <DataTable
          data={alertes}
          columns={columns}
          getRowId={(a) => a.id}
          renderCard={(a) => (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{a.label}</span>
                <StatusBadge kind="legalDocument" value={a.status} />
              </div>
              <div className="text-muted-foreground text-xs">
                {t("columnExpiry")} : {formatDate(a.expiresAt)}
              </div>
              <LegalDocumentAccessButton documentId={a.id} />
            </div>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
