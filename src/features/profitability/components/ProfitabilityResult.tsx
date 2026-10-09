"use client";

import { useTranslations } from "next-intl";
import type { Profitability } from "../api/schemas";
import { Montant } from "./Montant";
import { StatCard, StatGrid } from "@/components/shared/StatCard";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNombre, formatPourcentage } from "@/lib/format";
import { cn } from "@/lib/utils";

/** Résultat du simulateur de rentabilité (idée #48), calculé par le backend. */
export function ProfitabilityResult({
  resultat: r,
}: Readonly<{ resultat: Profitability }>) {
  const t = useTranslations("profitability.result");
  const ts = useTranslations("profitability.scenarios");
  const devise = r.currency;

  return (
    <section className="space-y-4" aria-live="polite">
      <h2 className="font-semibold">
        {r.packageTitle
          ? t("titlePackage", { title: r.packageTitle })
          : t("title")}
      </h2>
      <StatGrid columns={3}>
        <StatCard
          title={t("unitContribution")}
          value={<Montant valeur={r.unitContribution} devise={devise} />}
        >
          {t("commission", {
            rate: formatPourcentage(r.commissionRate),
          })}
        </StatCard>
        <StatCard
          title={t("breakEven")}
          value={
            r.breakEvenPilgrims === undefined
              ? t("never")
              : formatNombre(r.breakEvenPilgrims)
          }
        >
          {r.breakEvenPilgrims === undefined
            ? t("neverDetail")
            : r.breakEvenReachable
              ? t("breakEvenReachable", { capacity: r.capacity })
              : t("breakEvenUnreachable", { capacity: r.capacity })}
        </StatCard>
        <StatCard
          title={t("minimumPrice")}
          value={
            r.minimumPrice === undefined ? (
              "—"
            ) : (
              <Montant valeur={r.minimumPrice} devise={devise} />
            )
          }
        >
          {t("minimumPriceDetail")}
        </StatCard>
      </StatGrid>
      <div className="overflow-x-auto rounded-lg border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("scenario")}</TableHead>
              <TableHead className="text-right">{t("pilgrims")}</TableHead>
              <TableHead className="text-right">{t("revenue")}</TableHead>
              <TableHead className="text-right">{t("commissionCol")}</TableHead>
              <TableHead className="text-right">{t("variableCosts")}</TableHead>
              <TableHead className="text-right">{t("fixedCosts")}</TableHead>
              <TableHead className="text-right">{t("margin")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {r.scenarios.map((s) => (
              <TableRow key={s.kind}>
                <TableCell className="font-medium">{ts(s.kind)}</TableCell>
                <TableCell className="text-right tabular-nums">
                  {formatNombre(s.pilgrims)}
                </TableCell>
                <TableCell className="text-right">
                  <Montant valeur={s.revenue} devise={devise} />
                </TableCell>
                <TableCell className="text-right">
                  <Montant valeur={s.platformCommission} devise={devise} />
                </TableCell>
                <TableCell className="text-right">
                  <Montant valeur={s.variableCosts} devise={devise} />
                </TableCell>
                <TableCell className="text-right">
                  <Montant valeur={s.fixedCosts} devise={devise} />
                </TableCell>
                <TableCell
                  className={cn(
                    "text-right",
                    s.margin < 0 && "text-destructive",
                  )}
                >
                  <Montant valeur={s.margin} devise={devise} />
                  {s.marginRate !== undefined && (
                    <span className="text-muted-foreground ml-1 text-xs">
                      ({formatPourcentage(s.marginRate)})
                    </span>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <p className="text-muted-foreground text-xs">{t("disclaimer")}</p>
    </section>
  );
}
