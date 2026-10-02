"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, FileText } from "lucide-react";
import { useAdminLegalDocumentAccessUrl, useAgency } from "../api/use-agencies";
import type { Agency } from "../api/schemas";
import {
  ApproveAgencyDialog,
  RejectAgencyDialog,
} from "./AgencyDecisionDialogs";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { SignedUrlButton } from "@/components/shared/SignedUrlButton";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

/**
 * Dossier d'une agence pour l'administrateur (ticket #31) : coordonnées,
 * documents légaux ouverts par URL signée fraîche (règle 14, route admin
 * du backend), statut et décision motivée.
 */

function Bloc({
  titre,
  children,
}: Readonly<{ titre: string; children: ReactNode }>) {
  return (
    <section className="bg-card space-y-4 rounded-xl border p-5">
      <h2 className="text-base font-semibold">{titre}</h2>
      {children}
    </section>
  );
}

function Ligne({
  libelle,
  children,
}: Readonly<{ libelle: string; children: ReactNode }>) {
  return (
    <div className="grid gap-1 sm:grid-cols-[10rem_1fr]">
      <dt className="text-muted-foreground text-sm">{libelle}</dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}

function OuvrirDocument({
  agencyId,
  documentId,
}: Readonly<{ agencyId: string; documentId: string }>) {
  const t = useTranslations("agencyCompliance");
  const { mutateAsync, isPending } = useAdminLegalDocumentAccessUrl(agencyId);
  return (
    <SignedUrlButton
      obtenirUrl={async () => (await mutateAsync(documentId)).url}
      isPending={isPending}
      labels={{
        view: t("view"),
        opening: t("opening"),
        openError: t("openError"),
      }}
    />
  );
}

function Documents({ agence }: Readonly<{ agence: Agency }>) {
  const t = useTranslations("agencies.detail");
  if (agence.legalDocuments.length === 0) {
    return (
      <p className="bg-state-warning-bg text-state-warning rounded-md px-3 py-2 text-sm">
        {t("documentsEmpty")}
      </p>
    );
  }
  return (
    <ul className="divide-y rounded-lg border">
      {agence.legalDocuments.map((doc) => (
        <li
          key={doc.id}
          className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
        >
          <span className="flex items-start gap-3">
            <FileText
              aria-hidden
              className="text-muted-foreground mt-0.5 size-5"
            />
            <span className="space-y-0.5">
              <span className="block text-sm font-medium">{doc.label}</span>
              <span className="text-muted-foreground block text-xs">
                {t("uploadedAt", { date: formatDate(doc.uploadedAt) })} ·{" "}
                {doc.expiresAt
                  ? t("expiresAt", { date: formatDate(doc.expiresAt) })
                  : t("noExpiry")}
              </span>
            </span>
          </span>
          <OuvrirDocument agencyId={agence.id} documentId={doc.id} />
        </li>
      ))}
    </ul>
  );
}

function Decision({ agence }: Readonly<{ agence: Agency }>) {
  const t = useTranslations("agencies.detail");
  if (agence.validationStatus === "pending") {
    return (
      <div className="space-y-4">
        <p className="text-muted-foreground text-sm">{t("pendingHint")}</p>
        <div className="flex flex-wrap gap-3">
          <ApproveAgencyDialog agencyId={agence.id} />
          <RejectAgencyDialog agencyId={agence.id} />
        </div>
      </div>
    );
  }
  const date = agence.validatedAt ? formatDate(agence.validatedAt) : null;
  return (
    <div className="space-y-3">
      {date && (
        <p className="text-sm">
          {agence.validationStatus === "approved"
            ? t("approvedOn", { date })
            : t("rejectedOn", { date })}
        </p>
      )}
      {agence.rejectionReason && (
        <div className="bg-state-danger-bg space-y-1 rounded-md px-3 py-2">
          <p className="text-state-danger text-xs font-semibold uppercase">
            {t("rejectionReason")}
          </p>
          <p className="text-sm">{agence.rejectionReason}</p>
        </div>
      )}
    </div>
  );
}

export function AgencyValidationScreen({ id }: Readonly<{ id: string }>) {
  const t = useTranslations("agencies.detail");
  const query = useAgency(id);
  const introuvable =
    query.error instanceof ApiError && query.error.statusCode === 404;

  return (
    <div className="space-y-6">
      <Link
        href="/agencies"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("back")}
      </Link>
      {introuvable ? (
        <EmptyState title={t("notFound")} />
      ) : (
        <AsyncBoundary
          query={query}
          isEmpty={() => false}
          skeleton={
            <div className="space-y-4">
              <Skeleton className="h-8 w-64" />
              <Skeleton className="h-40 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
          }
        >
          {(agence) => (
            <div className="space-y-6">
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {agence.legalName}
                </h2>
                <StatusBadge kind="agency" value={agence.validationStatus} />
              </div>
              <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
                <div className="space-y-6">
                  <Bloc titre={t("contact")}>
                    <dl className="space-y-3">
                      <Ligne libelle={t("email")}>{agence.contactEmail}</Ligne>
                      <Ligne libelle={t("phone")}>
                        <span className="font-mono">{agence.contactPhone}</span>
                      </Ligne>
                      <Ligne libelle={t("address")}>
                        {agence.address ?? t("noAddress")}
                      </Ligne>
                    </dl>
                  </Bloc>
                  <Bloc titre={t("documentsTitle")}>
                    <Documents agence={agence} />
                  </Bloc>
                </div>
                <Bloc titre={t("decisionTitle")}>
                  <Decision agence={agence} />
                </Bloc>
              </div>
            </div>
          )}
        </AsyncBoundary>
      )}
    </div>
  );
}
