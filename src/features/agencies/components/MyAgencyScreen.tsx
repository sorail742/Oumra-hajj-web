"use client";

import { useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { Eye, EyeOff } from "lucide-react";
import { masquerCompte, useMyAgency } from "../api/use-my-agency";
import type { Agency } from "../api/schemas";
import { MyAgencyForm } from "./MyAgencyForm";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

/**
 * Profil de l'agence (ticket #47) : statut de validation et, en cas de
 * refus, le motif de l'administrateur (ticket #31) ; coordonnées de
 * contact (lecture) ; adresse et coordonnées bancaires (modifiables). Le
 * numéro de compte est masqué par défaut.
 */

function Statut({ agence }: Readonly<{ agence: Agency }>) {
  const t = useTranslations("myAgency");
  const cles = {
    pending: "statusPending",
    approved: "statusApproved",
    rejected: "statusRejected",
  } as const;

  return (
    <section className="bg-card space-y-3 rounded-xl border p-5">
      <div className="flex flex-wrap items-center gap-3">
        <h2 className="text-lg font-semibold">{agence.legalName}</h2>
        <StatusBadge kind="agency" value={agence.validationStatus} />
      </div>
      <p className="text-muted-foreground text-sm">
        {t(cles[agence.validationStatus], {
          date: agence.validatedAt ? formatDate(agence.validatedAt) : "",
        })}
      </p>
      {agence.rejectionReason && (
        <div className="bg-state-danger-bg space-y-1 rounded-md px-3 py-2">
          <p className="text-state-danger text-xs font-semibold uppercase">
            {t("rejectionReason")}
          </p>
          <p className="text-sm">{agence.rejectionReason}</p>
        </div>
      )}
      {agence.validationStatus !== "approved" && (
        <Link
          href="/legal-documents"
          className="text-primary inline-block text-sm font-medium hover:underline"
        >
          {t("documentsLink", { count: agence.legalDocuments.length })}
        </Link>
      )}
    </section>
  );
}

function CompteBancaire({ agence }: Readonly<{ agence: Agency }>) {
  const t = useTranslations("myAgency");
  const [visible, setVisible] = useState(false);
  const banque = agence.bankDetails;

  return (
    <section className="bg-card space-y-3 rounded-xl border p-5">
      <h2 className="text-base font-semibold">{t("currentBank")}</h2>
      {banque ? (
        <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
          <dt className="text-muted-foreground">{t("accountName")}</dt>
          <dd>{banque.accountName}</dd>
          <dt className="text-muted-foreground">{t("bankName")}</dt>
          <dd>{banque.bankName}</dd>
          <dt className="text-muted-foreground">{t("accountNumber")}</dt>
          <dd className="flex items-center gap-2">
            <span className="font-mono">
              {visible
                ? banque.accountNumber
                : masquerCompte(banque.accountNumber)}
            </span>
            <button
              type="button"
              onClick={() => setVisible((v) => !v)}
              aria-pressed={visible}
              aria-label={visible ? t("hideNumber") : t("showNumber")}
              className="text-muted-foreground hover:text-foreground inline-flex size-8 items-center justify-center rounded-md"
            >
              {visible ? (
                <EyeOff aria-hidden className="size-4" />
              ) : (
                <Eye aria-hidden className="size-4" />
              )}
            </button>
          </dd>
        </dl>
      ) : (
        <p className="bg-state-warning-bg text-state-warning rounded-md px-3 py-2 text-sm">
          {t("noBank")}
        </p>
      )}
    </section>
  );
}

export function MyAgencyScreen() {
  const t = useTranslations("myAgency");
  const query = useMyAgency();

  return (
    <AsyncBoundary
      query={query}
      isEmpty={() => false}
      skeleton={
        <div className="space-y-4">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
      }
    >
      {(agence) => (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
          <div className="space-y-6">
            <Statut agence={agence} />
            <section className="bg-card space-y-3 rounded-xl border p-5">
              <h2 className="text-base font-semibold">{t("contactTitle")}</h2>
              <dl className="grid gap-2 text-sm sm:grid-cols-[10rem_1fr]">
                <dt className="text-muted-foreground">{t("email")}</dt>
                <dd>{agence.contactEmail}</dd>
                <dt className="text-muted-foreground">{t("phone")}</dt>
                <dd className="font-mono">{agence.contactPhone}</dd>
              </dl>
              <p className="text-muted-foreground text-xs">
                {t("contactHint")}
              </p>
            </section>
            <CompteBancaire agence={agence} />
          </div>
          <MyAgencyForm agence={agence} />
        </div>
      )}
    </AsyncBoundary>
  );
}
