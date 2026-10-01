"use client";

import { useMemo } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { useBookingDocuments, useValidateDocument } from "../api/use-documents";
import type { PilgrimDocument } from "../api/schemas";
import { colonnesDocument, DocumentCard } from "./document-table";
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

  const columns = useMemo(
    () =>
      colonnesDocument(t, {
        avecExpiration: true,
        actions: (d) => (
          <Actions
            document={d}
            onValidate={valider}
            validating={validation.isPending}
          />
        ),
      }),
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
              <DocumentCard document={d} avecExpiration>
                <Actions
                  document={d}
                  onValidate={valider}
                  validating={validation.isPending}
                />
              </DocumentCard>
            )}
          />
        )}
      </AsyncBoundary>
    </section>
  );
}
