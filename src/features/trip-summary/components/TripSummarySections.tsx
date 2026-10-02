"use client";

import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Star } from "lucide-react";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate, formatNombre } from "@/lib/format";
import type { TripSummary } from "../api/schemas";

const CLE_ETAPE = {
  payment: "stepPayment",
  visa: "stepVisa",
  flight: "stepFlight",
  vaccination: "stepVaccination",
  documents: "stepDocuments",
} as const;

function Section({
  titre,
  children,
}: {
  titre: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <h3 className="text-lg font-medium">{titre}</h3>
      {children}
    </section>
  );
}

export function StepsSection({ steps }: { steps: TripSummary["steps"] }) {
  const t = useTranslations("tripSummary");
  const tEtapes = useTranslations("bookings");
  return (
    <Section titre={t("stepsTitle")}>
      <ul className="divide-y rounded-lg border">
        {steps.map((etape) => (
          <li
            key={etape.key}
            className="flex items-center justify-between gap-3 p-3 text-sm"
          >
            <span>{tEtapes(CLE_ETAPE[etape.key])}</span>
            <span className="flex items-center gap-3">
              {etape.completedAt && (
                <span className="text-muted-foreground">
                  {formatDate(etape.completedAt)}
                </span>
              )}
              <StatusBadge kind="dossierStep" value={etape.status} />
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function PaymentsSection({ summary }: { summary: TripSummary }) {
  const t = useTranslations("tripSummary");
  return (
    <Section titre={t("paymentsTitle")}>
      <div className="rounded-lg border p-4 text-sm space-y-1">
        <div className="text-2xl">
          {/* `formatGNF` suppose la devise GNF (voir lib/format) : une autre
              devise s'affiche avec son code réel, jamais un libellé faux. */}
          {summary.currency === "GNF" ? (
            <Money montant={summary.totalPaid} />
          ) : (
            <span className="font-mono tabular-nums">
              {formatNombre(summary.totalPaid)} {summary.currency}
            </span>
          )}
        </div>
        <div className="text-muted-foreground">
          {t("installments", { count: summary.installmentsCount })}
        </div>
      </div>
    </Section>
  );
}

export function RitesSection({ rites }: { rites: TripSummary["rites"] }) {
  const t = useTranslations("tripSummary");
  return (
    <Section titre={t("ritesTitle")}>
      {rites.length === 0 ? (
        <p className="text-sm text-muted-foreground">{t("noRites")}</p>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {rites.map((rite) => (
            <li
              key={rite.riteKey}
              className="flex items-start gap-3 rounded-lg border p-3 text-sm"
            >
              {rite.completed ? (
                <CheckCircle2
                  className="size-5 shrink-0 text-success"
                  aria-label={t("riteDone")}
                />
              ) : (
                <Circle
                  className="size-5 shrink-0 text-muted-foreground"
                  aria-label={t("riteNotDone")}
                />
              )}
              <div className="space-y-1">
                {/* Titre présent uniquement pour une fiche publiée, donc
                    validée côté backend — sinon libellé neutre, jamais la
                    clé technique. */}
                <div className="font-medium">
                  {rite.title ?? t("riteWithdrawn")}
                </div>
                {(rite.tawafCount > 0 || rite.saiCount > 0) && (
                  <div className="text-muted-foreground">
                    {t("counters", {
                      tawaf: rite.tawafCount,
                      sai: rite.saiCount,
                    })}
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Section>
  );
}

export function ReviewSection({ review }: { review: TripSummary["review"] }) {
  const t = useTranslations("tripSummary");
  return (
    <Section titre={t("reviewTitle")}>
      {review ? (
        <div className="rounded-lg border p-4 text-sm space-y-2">
          <div className="flex items-center gap-1">
            <Star className="size-4 text-accent" aria-hidden />
            <span>{t("rating", { rating: review.rating })}</span>
          </div>
          {review.comment && (
            <p className="text-muted-foreground">{review.comment}</p>
          )}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{t("noReview")}</p>
      )}
    </Section>
  );
}
