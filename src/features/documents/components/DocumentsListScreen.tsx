"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useMyDocuments } from "../api/use-documents";
import type { PilgrimDocument } from "../api/schemas";
import { DocumentAccessButton } from "./DocumentAccessButton";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const CLE_TRADUCTION_TYPE: Record<PilgrimDocument["type"], string> = {
  passport: "typePassport",
  visa: "typeVisa",
  flight_ticket: "typeFlightTicket",
  vaccination_certificate: "typeVaccinationCertificate",
};

export function DocumentsListScreen() {
  const t = useTranslations("documents");
  const query = useMyDocuments();

  const columns: ColumnDef<PilgrimDocument>[] = useMemo(
    () => [
      {
        accessorKey: "type",
        header: t("columnType"),
        cell: ({ row }) => t(CLE_TRADUCTION_TYPE[row.original.type]),
      },
      {
        accessorKey: "status",
        header: t("columnStatus"),
        cell: ({ row }) => (
          <StatusBadge kind="document" value={row.original.status} />
        ),
      },
      {
        id: "rejectionReason",
        header: t("columnRejectionReason"),
        cell: ({ row }) => row.original.rejectionReason ?? null,
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) => (
          <DocumentAccessButton documentId={row.original.id} />
        ),
      },
    ],
    [t],
  );

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
      {(documents) => (
        <DataTable
          data={documents}
          columns={columns}
          getRowId={(d) => d.id}
          renderCard={(d) => (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">
                  {t(CLE_TRADUCTION_TYPE[d.type])}
                </span>
                <StatusBadge kind="document" value={d.status} />
              </div>
              {d.rejectionReason ? (
                <p className="text-state-danger text-xs">{d.rejectionReason}</p>
              ) : null}
              <DocumentAccessButton documentId={d.id} />
            </div>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
