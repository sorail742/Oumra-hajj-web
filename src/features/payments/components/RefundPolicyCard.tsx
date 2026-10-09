"use client";

import { useTranslations } from "next-intl";
import { ReceiptText } from "lucide-react";
import { useBaremeAgence } from "../api/use-refund-policy";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Conditions de remboursement de l'agence (idée #58), lues avant de
 * réserver : elles seront figées sur la réservation.
 */
export function RefundPolicyCard({
  agencyId,
  compact = false,
}: Readonly<{ agencyId: string; compact?: boolean }>) {
  const t = useTranslations("payments.policy");
  const query = useBaremeAgence(agencyId);

  return (
    <section
      className={
        compact
          ? "space-y-2"
          : "bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)"
      }
    >
      <h2
        className={
          compact
            ? "flex items-center gap-2 text-sm font-medium"
            : "flex items-center gap-2 font-medium"
        }
      >
        <ReceiptText aria-hidden className="text-primary size-4" />
        {t("title")}
      </h2>
      {query.isPending ? (
        <Skeleton className="h-16 w-full" />
      ) : query.isError || !query.data ? (
        <p className="text-muted-foreground text-sm">{t("error")}</p>
      ) : (
        <ul className="space-y-1 text-sm">
          <li>{t("beforeConfirmation")}</li>
          {query.data.tiers.length === 0 ? (
            <li>{t("platformDefault")}</li>
          ) : (
            <>
              {query.data.tiers.map((p) => (
                <li key={p.minDaysBeforeDeparture}>
                  {t("tier", {
                    days: p.minDaysBeforeDeparture,
                    rate: Math.round(p.rate * 100),
                  })}
                </li>
              ))}
              <li>
                {t("belowLast", {
                  days: query.data.tiers.at(-1)?.minDaysBeforeDeparture ?? 0,
                })}
              </li>
            </>
          )}
          <li className="text-muted-foreground pt-1 text-xs">{t("frozen")}</li>
        </ul>
      )}
    </section>
  );
}
