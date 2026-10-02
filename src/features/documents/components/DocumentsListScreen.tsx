"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { useMyDocuments } from "../api/use-documents";
import { DocumentAccessButton } from "./DocumentAccessButton";
import { colonnesDocument, DocumentCard } from "./document-table";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export function DocumentsListScreen() {
  const t = useTranslations("documents");
  const query = useMyDocuments();

  const columns = useMemo(
    () =>
      colonnesDocument(t, {
        avecExpiration: false,
        actions: (d) => <DocumentAccessButton documentId={d.id} />,
      }),
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
          action={
            <Link
              href="/bookings"
              className="text-primary text-sm font-medium hover:underline"
            >
              {t("goToBookings")}
            </Link>
          }
        />
      }
    >
      {(documents) => (
        <DataTable
          data={documents}
          columns={columns}
          getRowId={(d) => d.id}
          renderCard={(d) => (
            <DocumentCard document={d} avecExpiration={false}>
              <DocumentAccessButton documentId={d.id} />
            </DocumentCard>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
