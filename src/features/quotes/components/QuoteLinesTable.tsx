"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import type { QuoteTotals } from "../api/schemas";
import { Money } from "@/components/shared/Money";
import { formatNombre, formatPourcentage } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Lignes et totaux d'un devis, tels que calculés par le backend (idée #49).
 * Empilés plutôt qu'en tableau : le client lit souvent le devis sur
 * téléphone, et un tableau à quatre colonnes y cachait les montants.
 */
export function QuoteLinesTable({ totaux }: Readonly<{ totaux: QuoteTotals }>) {
  const t = useTranslations("quotes.lines");
  const devise = totaux.currency;

  return (
    <section
      aria-label={t("title")}
      className="bg-card divide-y rounded-lg border"
    >
      <ul className="divide-y">
        {totaux.lines.map((l, i) => (
          <li key={`${i}-${l.label}`} className="space-y-1 p-4">
            <p className="font-medium">{l.label}</p>
            <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1 text-sm">
              <span className="text-muted-foreground">
                {formatNombre(l.quantity)} ×{" "}
                <Money montant={l.unitPrice} devise={devise} />
              </span>
              <Money montant={l.total} devise={devise} />
            </div>
          </li>
        ))}
      </ul>
      <dl className="space-y-2 p-4 text-sm">
        <Ligne libelle={t("subtotal")}>
          <Money montant={totaux.subtotal} devise={devise} />
        </Ligne>
        {totaux.discountAmount > 0 && (
          <Ligne
            libelle={t("discount", {
              rate: formatPourcentage(totaux.discountRate * 100),
            })}
          >
            − <Money montant={totaux.discountAmount} devise={devise} />
          </Ligne>
        )}
        <Ligne libelle={t("totalAmount")} fort>
          <Money montant={totaux.totalAmount} devise={devise} />
        </Ligne>
      </dl>
    </section>
  );
}

function Ligne({
  libelle,
  fort = false,
  children,
}: Readonly<{ libelle: string; fort?: boolean; children: ReactNode }>) {
  return (
    <div
      className={cn(
        "flex flex-wrap items-baseline justify-between gap-x-4",
        fort && "text-base font-semibold",
      )}
    >
      <dt>{libelle}</dt>
      <dd>{children}</dd>
    </div>
  );
}
