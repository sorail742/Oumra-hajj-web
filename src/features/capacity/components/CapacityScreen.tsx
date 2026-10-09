"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useSimulationCapacite } from "../api/use-capacity";
import {
  RATIO_MAX,
  RATIO_MIN,
  RECRUES_MAX,
  type CapacitySimulation,
} from "../api/schemas";
import { lireHypotheses } from "../lib/hypotheses";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { StatCard, StatGrid } from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatNombre } from "@/lib/format";

/**
 * Simulateur de capacité (idée #68) : guides actifs face aux voyages à
 * venir, au ratio pèlerins/guide et avec les recrues hypothétiques choisis
 * (dans l'URL, règle 8). Le ratio est un repère de l'agence.
 */
export function CapacityScreen() {
  const t = useTranslations("capacity");
  const params = useSearchParams();
  const router = useRouter();
  const { ratio, recrues } = lireHypotheses(params);
  const query = useSimulationCapacite(ratio, recrues);

  function changer(cle: "ratio" | "extra", valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    suivant.set(cle, valeur);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="grid max-w-lg gap-4 sm:grid-cols-2">
        <div className="space-y-1">
          <Label htmlFor="ratio">{t("ratio")}</Label>
          <Input
            id="ratio"
            type="number"
            inputMode="numeric"
            min={RATIO_MIN}
            max={RATIO_MAX}
            defaultValue={ratio}
            onChange={(e) => changer("ratio", e.target.value)}
            className="font-mono"
          />
          <p className="text-muted-foreground text-xs">{t("ratioHint")}</p>
        </div>
        <div className="space-y-1">
          <Label htmlFor="recrues">{t("extraGuides")}</Label>
          <Input
            id="recrues"
            type="number"
            inputMode="numeric"
            min={0}
            max={RECRUES_MAX}
            defaultValue={recrues}
            onChange={(e) => changer("extra", e.target.value)}
            className="font-mono"
          />
          <p className="text-muted-foreground text-xs">
            {t("extraGuidesHint")}
          </p>
        </div>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-96 w-full" />}
        isEmpty={() => false}
      >
        {(s) => <Resultat simulation={s} />}
      </AsyncBoundary>
    </div>
  );
}

function Resultat({
  simulation: s,
}: Readonly<{ simulation: CapacitySimulation }>) {
  const t = useTranslations("capacity");
  const titres = new Map(s.trips.map((v) => [v.packageId, v.title]));
  const manque = s.spareGuidesAtPeak < 0;

  return (
    <div className="space-y-6">
      <StatGrid columns={3}>
        <StatCard title={t("staff")} value={formatNombre(s.staff)}>
          {t("staffDetail", { guides: s.guides, extra: s.extraGuides })}
        </StatCard>
        <StatCard
          title={t("peakNeed")}
          value={formatNombre(s.peak?.guidesNeeded ?? 0)}
        >
          {s.peak
            ? t("peakDetail", {
                from: formatDate(s.peak.from),
                to: formatDate(s.peak.to),
                pilgrims: formatNombre(s.peak.plannedPilgrims),
              })
            : t("noTrip")}
        </StatCard>
        <StatCard
          title={manque ? t("shortfall") : t("headroom")}
          value={formatNombre(
            manque ? -s.spareGuidesAtPeak : s.extraPilgrimsAtPeak,
          )}
        >
          {manque ? t("shortfallDetail") : t("headroomDetail")}
        </StatCard>
      </StatGrid>

      {s.trips.length > 0 && (
        <section className="space-y-2">
          <h2 className="font-semibold">{t("tripsTitle")}</h2>
          <div className="overflow-x-auto rounded-lg border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>{t("trip")}</TableHead>
                  <TableHead>{t("dates")}</TableHead>
                  <TableHead className="text-right">{t("seats")}</TableHead>
                  <TableHead className="text-right">{t("guides")}</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {s.trips.map((v) => (
                  <TableRow key={v.packageId}>
                    <TableCell className="font-medium">{v.title}</TableCell>
                    <TableCell className="tabular-nums">
                      {formatDate(v.startDate)} → {formatDate(v.endDate)}
                    </TableCell>
                    <TableCell className="text-right tabular-nums">
                      {v.seatsTaken} / {v.capacity}
                    </TableCell>
                    <TableCell
                      className={
                        v.guidesAssigned < v.guidesNeeded
                          ? "text-warning text-right tabular-nums"
                          : "text-right tabular-nums"
                      }
                    >
                      {t("guidesCell", {
                        assigned: v.guidesAssigned,
                        needed: v.guidesNeeded,
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </section>
      )}

      {s.periods.some((p) => p.packageIds.length > 1) && (
        <section className="space-y-2">
          <h2 className="font-semibold">{t("overlapsTitle")}</h2>
          <ul className="space-y-2 text-sm">
            {s.periods
              .filter((p) => p.packageIds.length > 1)
              .map((p) => (
                <li
                  key={p.from}
                  className={
                    p.guidesNeeded > s.staff ? "text-warning" : undefined
                  }
                >
                  {t("overlap", {
                    from: formatDate(p.from),
                    to: formatDate(p.to),
                    trips: p.packageIds
                      .map((id) => titres.get(id) ?? id)
                      .join(", "),
                    needed: p.guidesNeeded,
                    staff: s.staff,
                  })}
                </li>
              ))}
          </ul>
        </section>
      )}
    </div>
  );
}
