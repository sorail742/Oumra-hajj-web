"use client";

import { useTranslations } from "next-intl";
import { useContrat } from "../api/use-billing";
import { BillingPartyBlock } from "./BillingParty";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { Money } from "@/components/shared/Money";
import { formatDate, formatDistance } from "@/lib/format";

/**
 * Contrat de voyage d'une réservation (idée #37), établi à partir du
 * dossier : parties, prestations, prix, échéance du solde et barème de
 * remboursement figé à la réservation. Le texte des articles est un
 * modèle : l'écran le signale tant qu'un juriste ne l'a pas validé.
 */
export function ContractDocument({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("billing");
  const query = useContrat(bookingId);

  return (
    <AsyncBoundary query={query} skeleton={<DetailSkeleton />}>
      {(c) => (
        <article className="bg-card mx-auto max-w-3xl space-y-7 rounded-lg border p-6 text-sm shadow-(--shadow-card) sm:p-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
          <p className="bg-state-warning-bg text-foreground rounded-md px-3 py-2 text-xs print:hidden">
            {t("contractDraftNotice")}
          </p>
          <header className="space-y-1 text-center">
            <h1 className="text-2xl font-semibold">{t("contractTitle")}</h1>
            <p className="text-muted-foreground">
              {t("contractRef", {
                booking: c.bookingId,
                date: formatDate(c.bookedAt),
              })}
            </p>
          </header>

          <Article numero={1} titre={t("art.parties")}>
            <div className="grid gap-6 sm:grid-cols-2">
              <BillingPartyBlock
                titre={t("organizer")}
                partie={c.agency}
                mentionsLegales
              />
              <BillingPartyBlock titre={t("traveller")} partie={c.pilgrim} />
            </div>
          </Article>

          <Article numero={2} titre={t("art.object")}>
            <p>
              {t("objectText", {
                type: t(`types.${c.packageType}`),
                title: c.packageTitle,
                from: formatDate(c.startDate),
                to: formatDate(c.endDate),
              })}
            </p>
            {c.description && (
              <p className="text-muted-foreground">{c.description}</p>
            )}
          </Article>

          <Article numero={3} titre={t("art.services")}>
            {c.stages.length > 0 && (
              <ul className="list-disc space-y-1 pl-5">
                {c.stages.map((e) => (
                  <li key={`${e.city}-${e.startDate}`}>
                    {t("stage", {
                      city: e.city,
                      hotel: e.hotelName,
                      from: formatDate(e.startDate),
                      to: formatDate(e.endDate),
                    })}
                    {e.distanceToMosqueMeters !== undefined &&
                      ` — ${formatDistance(e.distanceToMosqueMeters)}`}
                  </li>
                ))}
              </ul>
            )}
            {c.inclusions.length > 0 && (
              <p>
                {t("inclusions")} {c.inclusions.join(", ")}.
              </p>
            )}
          </Article>

          <Article numero={4} titre={t("art.price")}>
            <p>
              {t("priceText")} <Money montant={c.price} />.
            </p>
            <p>{t("balanceText", { date: formatDate(c.balanceDueDate) })}</p>
          </Article>

          <Article numero={5} titre={t("art.cancellation")}>
            <p>{t("cancelUnpaid")}</p>
            {c.refundTiers.length === 0 ? (
              <p>{t("cancelDefault")}</p>
            ) : (
              <ul className="list-disc space-y-1 pl-5">
                {c.refundTiers.map((p) => (
                  <li key={p.minDaysBeforeDeparture}>
                    {t("cancelTier", {
                      days: p.minDaysBeforeDeparture,
                      rate: Math.round(p.rate * 100),
                    })}
                  </li>
                ))}
                <li>
                  {t("cancelBelow", {
                    days: c.refundTiers.at(-1)?.minDaysBeforeDeparture ?? 0,
                  })}
                </li>
              </ul>
            )}
          </Article>

          <section className="grid gap-8 pt-6 sm:grid-cols-2">
            {[t("organizer"), t("traveller")].map((partie) => (
              <div key={partie} className="space-y-12">
                <p className="font-medium">
                  {t("signature", { party: partie })}
                </p>
                <p className="text-muted-foreground border-t pt-1 text-xs">
                  {t("signatureHint")}
                </p>
              </div>
            ))}
          </section>

          <footer className="text-muted-foreground border-t pt-4 text-xs">
            {t("generatedOn", { date: formatDate(c.generatedAt) })}
          </footer>
        </article>
      )}
    </AsyncBoundary>
  );
}

function Article({
  numero,
  titre,
  children,
}: Readonly<{ numero: number; titre: string; children: React.ReactNode }>) {
  return (
    <section className="space-y-2">
      <h2 className="font-semibold">
        {numero}. {titre}
      </h2>
      {children}
    </section>
  );
}
