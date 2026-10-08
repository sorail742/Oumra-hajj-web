"use client";

import { useTranslations } from "next-intl";
import { FileText } from "lucide-react";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { formatDate } from "@/lib/format";
import { useMyAgency } from "../api/use-my-agency";
import { useComplianceAlerts } from "../api/use-legal-documents";
import { LegalDocumentAccessButton } from "./LegalDocumentAccessButton";

/**
 * Tous les documents légaux de l'agence (ticket #48), pas seulement ceux
 * en alerte. Le statut d'échéance vient du backend (alertes) : un document
 * sans échéance n'est jamais présenté comme expiré.
 */
export function LegalDocumentsLibrary() {
  const t = useTranslations("agencyCompliance.library");
  const query = useMyAgency();
  const { data: alertes = [] } = useComplianceAlerts();
  const statutParDocument = new Map(alertes.map((a) => [a.id, a.status]));

  return (
    <section aria-labelledby="documents-legaux" className="space-y-3">
      <h2 id="documents-legaux" className="text-lg font-semibold">
        {t("title")}
      </h2>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={3} />}
        isEmpty={(agence) => agence.legalDocuments.length === 0}
        empty={
          <div className="bg-card rounded-lg border">
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          </div>
        }
      >
        {(agence) => (
          <ul className="bg-card divide-y rounded-lg border shadow-(--shadow-card)">
            {[...agence.legalDocuments]
              .sort((a, b) => b.uploadedAt.localeCompare(a.uploadedAt))
              .map((doc) => {
                const statut = statutParDocument.get(doc.id);
                return (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <span className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-md">
                        <FileText aria-hidden className="size-4" />
                      </span>
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-medium">
                          {doc.label}
                        </span>
                        <span className="text-muted-foreground block text-xs">
                          {t("uploaded", { date: formatDate(doc.uploadedAt) })}
                          {" · "}
                          {doc.expiresAt
                            ? t("expires", { date: formatDate(doc.expiresAt) })
                            : t("noExpiry")}
                        </span>
                      </span>
                    </span>
                    <span className="flex items-center gap-3">
                      {statut && (
                        <StatusBadge kind="legalDocument" value={statut} />
                      )}
                      <LegalDocumentAccessButton documentId={doc.id} />
                    </span>
                  </li>
                );
              })}
          </ul>
        )}
      </AsyncBoundary>
    </section>
  );
}
