"use client";

import type { ReactNode } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useComparatifSaisons } from "../api/use-seasons";
import type { Season } from "../api/schemas";
import { lirePeriode, SAISONS_MAX } from "../lib/periode";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Money } from "@/components/shared/Money";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatNombre, formatNote, formatPourcentage } from "@/lib/format";

const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";

function Montants({
  montants,
}: Readonly<{ montants: Season["collected"] | undefined }>) {
  if (!montants || montants.length === 0) return <>—</>;
  return (
    <>
      {montants.map((m) => (
        <span key={m.currency} className="block">
          <Money montant={m.amount} devise={m.currency} />
        </span>
      ))}
    </>
  );
}

function Mesure({
  libelle,
  children,
}: Readonly<{ libelle: string; children: ReactNode }>) {
  return (
    <div className="flex items-baseline justify-between gap-4">
      <dt className="text-muted-foreground">{libelle}</dt>
      <dd className="text-right tabular-nums">{children}</dd>
    </div>
  );
}

/**
 * Comparatif inter-saisons (idée #65) : une ligne par année et type de
 * pèlerinage, période dans l'URL (règle 8).
 */
export function SeasonsScreen() {
  const t = useTranslations("seasons");
  const tt = useTranslations("seasons.types");
  const params = useSearchParams();
  const router = useRouter();
  const anneeCourante = new Date().getUTCFullYear();
  const { fromYear, toYear } = lirePeriode(params, anneeCourante);
  const query = useComparatifSaisons(fromYear, toYear);
  const annees = Array.from(
    { length: SAISONS_MAX + 1 },
    (_, i) => anneeCourante + 1 - i,
  );

  function changer(cle: "from" | "to", valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    suivant.set(cle, valeur);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  const choix = (cle: "from" | "to", valeur: number) => (
    <div className="space-y-1">
      <Label htmlFor={`annee-${cle}`}>{t(cle)}</Label>
      <select
        id={`annee-${cle}`}
        value={valeur}
        onChange={(e) => changer(cle, e.target.value)}
        className={SELECT}
      >
        {annees.map((a) => (
          <option key={a} value={a}>
            {a}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-6">
      <div className="grid max-w-sm grid-cols-2 gap-4">
        {choix("from", fromYear)}
        {choix("to", toYear)}
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={4} />}
        isEmpty={(c) => c.seasons.length === 0}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(c) => (
          <>
            <ul className="space-y-3 sm:hidden">
              {c.seasons.map((s) => (
                <li
                  key={`${s.year}-${s.type}`}
                  className="bg-card rounded-lg border p-4 shadow-(--shadow-card)"
                >
                  <p className="mb-2 font-semibold">
                    {tt(s.type)} {s.year}
                  </p>
                  <dl className="space-y-1 text-sm">
                    <Mesure libelle={t("packages")}>
                      {formatNombre(s.packages)}
                    </Mesure>
                    <Mesure libelle={t("fill")}>
                      {t("fillCell", {
                        bookings: formatNombre(s.bookings),
                        capacity: formatNombre(s.capacity),
                      })}
                      {s.fillRate !== undefined &&
                        ` (${formatPourcentage(s.fillRate * 100)})`}
                    </Mesure>
                    <Mesure libelle={t("cancellations")}>
                      {formatNombre(s.cancellations)}
                    </Mesure>
                    <Mesure libelle={t("averagePrice")}>
                      <Montants montants={s.averagePrice} />
                    </Mesure>
                    <Mesure libelle={t("collected")}>
                      <Montants montants={s.collected} />
                    </Mesure>
                    <Mesure libelle={t("rating")}>
                      {s.averageRating === undefined
                        ? "—"
                        : t("ratingCell", {
                            rating: formatNote(s.averageRating),
                            count: s.reviews,
                          })}
                    </Mesure>
                    <Mesure libelle={t("disputes")}>
                      {formatNombre(s.disputes)}
                    </Mesure>
                  </dl>
                </li>
              ))}
            </ul>
            <div className="hidden overflow-x-auto rounded-lg border sm:block">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>{t("season")}</TableHead>
                    <TableHead className="text-right">
                      {t("packages")}
                    </TableHead>
                    <TableHead className="text-right">{t("fill")}</TableHead>
                    <TableHead className="text-right">
                      {t("cancellations")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("averagePrice")}
                    </TableHead>
                    <TableHead className="text-right">
                      {t("collected")}
                    </TableHead>
                    <TableHead className="text-right">{t("rating")}</TableHead>
                    <TableHead className="text-right">
                      {t("disputes")}
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {c.seasons.map((s) => (
                    <TableRow key={`${s.year}-${s.type}`}>
                      <TableCell className="font-medium whitespace-nowrap">
                        {tt(s.type)} {s.year}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNombre(s.packages)}
                      </TableCell>
                      <TableCell className="text-right tabular-nums whitespace-nowrap">
                        {t("fillCell", {
                          bookings: formatNombre(s.bookings),
                          capacity: formatNombre(s.capacity),
                        })}
                        {s.fillRate !== undefined && (
                          <span className="text-muted-foreground block text-xs">
                            {formatPourcentage(s.fillRate * 100)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNombre(s.cancellations)}
                        {s.cancellationRate !== undefined && (
                          <span className="text-muted-foreground block text-xs">
                            {formatPourcentage(s.cancellationRate * 100)}
                          </span>
                        )}
                      </TableCell>
                      <TableCell className="text-right">
                        <Montants montants={s.averagePrice} />
                      </TableCell>
                      <TableCell className="text-right">
                        <Montants montants={s.collected} />
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {s.averageRating === undefined
                          ? "—"
                          : t("ratingCell", {
                              rating: formatNote(s.averageRating),
                              count: s.reviews,
                            })}
                      </TableCell>
                      <TableCell className="text-right tabular-nums">
                        {formatNombre(s.disputes)}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </>
        )}
      </AsyncBoundary>
      <p className="text-muted-foreground text-xs">{t("hint")}</p>
    </div>
  );
}
