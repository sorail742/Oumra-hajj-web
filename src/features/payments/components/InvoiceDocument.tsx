"use client";

import { useTranslations } from "next-intl";
import { useFacture } from "../api/use-billing";
import { CLE_TRADUCTION_METHODE } from "../lib/payment-method";
import { BillingPartyBlock } from "./BillingParty";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { Money } from "@/components/shared/Money";
import { formatDate } from "@/lib/format";

/**
 * Facture d'une réservation (idée #37), mise en page pour l'écran comme
 * pour l'impression. Numéro et montant viennent du backend, qui l'émet à
 * la première lecture.
 */
export function InvoiceDocument({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("billing");
  const tp = useTranslations("payments");
  const query = useFacture(bookingId);

  return (
    <AsyncBoundary query={query} skeleton={<DetailSkeleton />}>
      {(f) => (
        <article className="bg-card mx-auto max-w-3xl space-y-8 rounded-lg border p-6 shadow-(--shadow-card) sm:p-10 print:max-w-none print:border-0 print:p-0 print:shadow-none">
          <header className="flex flex-wrap items-start justify-between gap-6">
            <BillingPartyBlock
              titre={t("seller")}
              partie={f.seller}
              mentionsLegales
            />
            <div className="space-y-1 text-right">
              <h1 className="text-2xl font-semibold">{t("invoiceTitle")}</h1>
              <p className="font-mono text-sm">{f.number}</p>
              <p className="text-muted-foreground text-sm">
                {t("issuedOn", { date: formatDate(f.issuedAt) })}
              </p>
            </div>
          </header>

          <BillingPartyBlock titre={t("buyer")} partie={f.buyer} />

          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left">
                <th className="py-2 font-medium">{t("designation")}</th>
                <th className="py-2 text-right font-medium">{t("quantity")}</th>
                <th className="py-2 text-right font-medium">{t("amount")}</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b align-top">
                <td className="py-3">
                  <p className="font-medium">{f.packageTitle}</p>
                  <p className="text-muted-foreground">
                    {t(`types.${f.packageType}`)} ·{" "}
                    {t("period", {
                      from: formatDate(f.startDate),
                      to: formatDate(f.endDate),
                    })}
                  </p>
                </td>
                <td className="py-3 text-right font-mono">1</td>
                <td className="py-3 text-right">
                  <Money montant={f.totalAmount} />
                </td>
              </tr>
            </tbody>
          </table>

          <dl className="ml-auto max-w-xs space-y-1 text-sm">
            <Ligne libelle={t("total")} montant={f.totalAmount} fort />
            <Ligne libelle={t("paid")} montant={f.paid} />
            {f.refunded > 0 && (
              <Ligne libelle={t("refunded")} montant={f.refunded} />
            )}
            <Ligne libelle={t("balanceDue")} montant={f.balanceDue} fort />
          </dl>

          {f.payments.length > 0 && (
            <section className="space-y-2">
              <h2 className="text-sm font-semibold">{t("payments")}</h2>
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-muted-foreground border-b text-left">
                    <th className="py-1.5 font-medium">{t("date")}</th>
                    <th className="py-1.5 font-medium">{t("method")}</th>
                    <th className="py-1.5 font-medium">{t("receipt")}</th>
                    <th className="py-1.5 text-right font-medium">
                      {t("amount")}
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {f.payments.map((p) => (
                    <tr
                      key={`${p.date}-${p.amount}-${p.receiptRef ?? ""}`}
                      className="border-b"
                    >
                      <td className="py-1.5">{formatDate(p.date)}</td>
                      <td className="py-1.5">
                        {tp(CLE_TRADUCTION_METHODE[p.method])}
                      </td>
                      <td className="py-1.5 font-mono text-xs break-all">
                        {p.receiptRef ?? "—"}
                      </td>
                      <td className="py-1.5 text-right">
                        <Money montant={p.amount} />
                        {p.refundedAmount ? (
                          <span className="text-muted-foreground block text-xs">
                            {t("refundedPart")}{" "}
                            <Money montant={p.refundedAmount} />
                          </span>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </section>
          )}

          <footer className="text-muted-foreground border-t pt-4 text-xs">
            {t("invoiceFooter", { booking: f.bookingId })}
          </footer>
        </article>
      )}
    </AsyncBoundary>
  );
}

function Ligne({
  libelle,
  montant,
  fort = false,
}: Readonly<{ libelle: string; montant: number; fort?: boolean }>) {
  return (
    <div
      className={
        fort ? "flex justify-between font-semibold" : "flex justify-between"
      }
    >
      <dt>{libelle}</dt>
      <dd>
        <Money montant={montant} />
      </dd>
    </div>
  );
}
