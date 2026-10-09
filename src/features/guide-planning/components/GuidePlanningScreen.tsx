"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  useMonPlanning,
  usePlanningAgence,
  useSupprimerIndisponibilite,
  type Fenetre,
} from "../api/use-guide-planning";
import { AddUnavailabilityDialog } from "./AddUnavailabilityDialog";
import { ScheduleList } from "./ScheduleList";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard, StatGrid } from "@/components/shared/StatCard";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";

const DATE_JOUR = /^\d{4}-\d{2}-\d{2}$/;

function useFenetre(): [Fenetre, (cle: "from" | "to", v: string) => void] {
  const params = useSearchParams();
  const router = useRouter();
  const lire = (v: string | null) => (v && DATE_JOUR.test(v) ? v : undefined);
  const fenetre = {
    from: lire(params.get("from")),
    to: lire(params.get("to")),
  };
  function definir(cle: "from" | "to", valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set(cle, valeur);
    else suivant.delete(cle);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }
  return [fenetre, definir];
}

function FiltrePeriode({
  fenetre,
  definir,
}: Readonly<{
  fenetre: Fenetre;
  definir: (cle: "from" | "to", v: string) => void;
}>) {
  const t = useTranslations("guidePlanning");
  return (
    <div className="flex flex-wrap items-end gap-3">
      {(["from", "to"] as const).map((cle) => (
        <div key={cle} className="space-y-1">
          <Label htmlFor={`planning-${cle}`}>{t(cle)}</Label>
          <Input
            id={`planning-${cle}`}
            type="date"
            className="w-44"
            value={fenetre[cle] ?? ""}
            onChange={(e) => definir(cle, e.target.value)}
          />
        </div>
      ))}
    </div>
  );
}

/**
 * Planning des guides de l'agence (idée #42) : par guide, groupes et
 * indisponibilités sur la période (dans l'URL, règle 8), conflits en tête.
 */
export function AgencyPlanningScreen() {
  const t = useTranslations("guidePlanning");
  const [fenetre, definir] = useFenetre();
  const query = usePlanningAgence(fenetre);
  const suppression = useSupprimerIndisponibilite();

  function supprimer(id: string) {
    suppression
      .mutateAsync(id)
      .then(() => toast.success(t("deleted")))
      .catch(() => toast.error(t("deleteError")));
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <FiltrePeriode fenetre={fenetre} definir={definir} />
        <AddUnavailabilityDialog
          guides={(query.data ?? []).map((g) => ({
            id: g.guideId,
            name: g.guideName,
          }))}
        />
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-64 w-full" />}
        empty={
          <EmptyState
            title={t("noGuideTitle")}
            description={t("noGuideDescription")}
          />
        }
      >
        {(plannings) => (
          <div className="space-y-6">
            <StatGrid columns={3}>
              <StatCard title={t("statGuides")} value={plannings.length} />
              <StatCard
                title={t("statAssigned")}
                value={
                  plannings.filter((p) =>
                    p.entries.some((e) => e.kind === "group"),
                  ).length
                }
              />
              <StatCard
                title={t("statConflicts")}
                value={plannings.reduce((s, p) => s + p.conflicts.length, 0)}
              />
            </StatGrid>
            <div className="grid gap-4 xl:grid-cols-2">
              {plannings.map((p) => (
                <section
                  key={p.guideId}
                  className="bg-card space-y-3 rounded-lg border p-4 shadow-(--shadow-card) sm:p-5"
                >
                  <h2 className="font-semibold">{p.guideName}</h2>
                  <ScheduleList planning={p} onDelete={supprimer} />
                </section>
              ))}
            </div>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}

/** Planning du guide connecté : ses groupes et indisponibilités. */
export function MyPlanningScreen() {
  const [fenetre, definir] = useFenetre();
  const query = useMonPlanning(fenetre);
  return (
    <div className="space-y-6">
      <FiltrePeriode fenetre={fenetre} definir={definir} />
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-48 w-full" />}
        isEmpty={() => false}
      >
        {(planning) => (
          <section className="bg-card rounded-lg border p-4 shadow-(--shadow-card) sm:p-5">
            <ScheduleList planning={planning} />
          </section>
        )}
      </AsyncBoundary>
    </div>
  );
}
