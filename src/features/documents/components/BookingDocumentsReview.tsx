"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { useBookingDocuments, useValidateDocument } from "../api/use-documents";
import type { PilgrimDocument } from "../api/schemas";
import { CLE_TRADUCTION_TYPE } from "../lib/document-type";
import { DocumentAccessButton } from "./DocumentAccessButton";
import { RejectDocumentDialog } from "./RejectDocumentDialog";

/**
 * Composant de module, pas défini dans le rendu : sinon React le
 * remonterait à chaque rendu (refetch en arrière-plan compris) et fermerait
 * une modale de refus en cours de saisie.
 */
function Actions({
  document,
  onValidate,
  validating,
}: {
  document: PilgrimDocument;
  onValidate: (documentId: string) => void;
  validating: boolean;
}) {
  const t = useTranslations("documents.review");
  return (
    <div className="flex flex-wrap gap-2 md:justify-end">
      <DocumentAccessButton documentId={document.id} />
      {document.status !== "validated" && (
        <Button
          variant="outline"
          size="sm"
          className="text-success hover:text-success"
          onClick={() => onValidate(document.id)}
          disabled={validating}
        >
          {t("validate")}
        </Button>
      )}
      {document.status !== "rejected" && (
        <RejectDocumentDialog documentId={document.id} disabled={validating} />
      )}
    </div>
  );
}

/**
 * Contrôle des pièces d'un dossier par l'agence (ticket #38) : consulter
 * (URL signée fraîche à chaque clic, règle 14), valider en un clic,
 * refuser avec motif. Les transitions autorisées sont décidées par le
 * backend : l'écran masque seulement l'action qui ramènerait le document
 * au statut qu'il a déjà.
 */
export function BookingDocumentsReview({ bookingId }: { bookingId: string }) {
  const t = useTranslations("documents");
  const query = useBookingDocuments(bookingId);
  const validation = useValidateDocument();

  async function valider(documentId: string) {
    try {
      await validation.mutateAsync(documentId);
      toast.success(t("review.validateSuccess"));
    } catch {
      toast.error(t("review.validateError"));
    }
  }

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
        id: "expiresAt",
        header: t("review.columnExpiresAt"),
        cell: ({ row }) =>
          row.original.expiresAt
            ? formatDate(row.original.expiresAt)
            : t("review.noExpiry"),
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
          <Actions
            document={row.original}
            onValidate={valider}
            validating={validation.isPending}
          />
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `valider` ne lit que `validation.mutateAsync`, stable.
    [t, validation.isPending],
  );

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">{t("review.title")}</h2>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={4} />}
        empty={
          <EmptyState
            title={t("review.emptyTitle")}
            description={t("review.emptyDescription")}
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
                {d.expiresAt && (
                  <p className="text-xs text-muted-foreground">
                    {t("review.columnExpiresAt")} : {formatDate(d.expiresAt)}
                  </p>
                )}
                {d.rejectionReason && (
                  <p className="text-xs text-state-danger">
                    {d.rejectionReason}
                  </p>
                )}
                <Actions
                  document={d}
                  onValidate={valider}
                  validating={validation.isPending}
                />
              </div>
            )}
          />
        )}
      </AsyncBoundary>
    </section>
  );
}
