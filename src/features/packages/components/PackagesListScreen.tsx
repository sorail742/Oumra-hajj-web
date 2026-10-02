"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { FilterBar } from "@/components/shared/FilterBar";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackages } from "../api/use-packages";
import type { PackageFilters } from "../api/schemas";
import { PackageCard } from "./PackageCard";

/**
 * Catalogue public des forfaits (ticket #51) : cartes, filtres dans l'URL
 * (`CLAUDE.md` règle 8) — type, budget maximum, nombre de voyageurs
 * (`familySize`, filtre côté backend sur les places restantes) et fenêtre
 * de départ.
 */

const CLES_FILTRES = [
  "type",
  "maxBudget",
  "familySize",
  "startDateFrom",
  "startDateTo",
] as const;

function nombreOuRien(valeur: string | null): number | undefined {
  if (!valeur) return undefined;
  const nombre = Number(valeur);
  return Number.isFinite(nombre) && nombre > 0 ? nombre : undefined;
}

function useFiltres(): [
  PackageFilters,
  (
    patch: Partial<Record<(typeof CLES_FILTRES)[number], string | undefined>>,
  ) => void,
  () => void,
] {
  const params = useSearchParams();
  const router = useRouter();

  const filtres: PackageFilters = useMemo(() => {
    const type = params.get("type");
    return {
      type: type === "oumra" || type === "hadj" ? type : undefined,
      maxBudget: nombreOuRien(params.get("maxBudget")),
      familySize: nombreOuRien(params.get("familySize")),
      startDateFrom: params.get("startDateFrom") ?? undefined,
      startDateTo: params.get("startDateTo") ?? undefined,
    };
  }, [params]);

  function definir(
    patch: Partial<Record<(typeof CLES_FILTRES)[number], string | undefined>>,
  ) {
    const suivant = new URLSearchParams(params.toString());
    for (const [cle, valeur] of Object.entries(patch)) {
      if (valeur) {
        suivant.set(cle, valeur);
      } else {
        suivant.delete(cle);
      }
    }
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  function effacer() {
    router.replace("?", { scroll: false });
  }

  return [filtres, definir, effacer];
}

function SqueletteCartes() {
  return (
    <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {["a", "b", "c", "d", "e", "f"].map((cle) => (
        <Skeleton key={cle} className="h-80 rounded-xl" />
      ))}
    </div>
  );
}

const champ =
  "border-input bg-background h-(--size-field) rounded-md border px-3 text-sm";

export function PackagesListScreen() {
  const t = useTranslations("packages");
  const [filtres, definir, effacer] = useFiltres();
  const query = usePackages(filtres);
  const filtreActif = Object.values(filtres).some(Boolean);

  return (
    <div className="space-y-6">
      <FilterBar>
        <div className="space-y-1">
          <Label htmlFor="filtre-type">{t("filterType")}</Label>
          <select
            id="filtre-type"
            className={champ}
            value={filtres.type ?? ""}
            onChange={(e) => definir({ type: e.target.value })}
          >
            <option value="">{t("filterTypeAll")}</option>
            <option value="oumra">{t("typeOumra")}</option>
            <option value="hadj">{t("typeHadj")}</option>
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="filtre-budget">{t("filterMaxBudget")}</Label>
          <Input
            id="filtre-budget"
            type="number"
            inputMode="numeric"
            min={0}
            className="w-44 font-mono"
            value={filtres.maxBudget ?? ""}
            onChange={(e) => definir({ maxBudget: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filtre-voyageurs">{t("filterFamilySize")}</Label>
          <Input
            id="filtre-voyageurs"
            type="number"
            inputMode="numeric"
            min={1}
            className="w-28 font-mono"
            value={filtres.familySize ?? ""}
            onChange={(e) => definir({ familySize: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filtre-depart-du">{t("filterStartFrom")}</Label>
          <Input
            id="filtre-depart-du"
            type="date"
            className="w-44"
            value={filtres.startDateFrom ?? ""}
            onChange={(e) => definir({ startDateFrom: e.target.value })}
          />
        </div>
        <div className="space-y-1">
          <Label htmlFor="filtre-depart-au">{t("filterStartTo")}</Label>
          <Input
            id="filtre-depart-au"
            type="date"
            className="w-44"
            value={filtres.startDateTo ?? ""}
            onChange={(e) => definir({ startDateTo: e.target.value })}
          />
        </div>
        {filtreActif && (
          <button
            type="button"
            onClick={effacer}
            className="text-primary h-(--size-field) text-sm font-medium hover:underline"
          >
            {t("filterReset")}
          </button>
        )}
      </FilterBar>

      <AsyncBoundary
        query={query}
        skeleton={<SqueletteCartes />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(forfaits) => (
          <div className="space-y-4">
            <p className="text-muted-foreground text-sm" aria-live="polite">
              {t("resultCount", { count: forfaits.length })}
            </p>
            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {forfaits.map((forfait) => (
                <PackageCard key={forfait.id} forfait={forfait} />
              ))}
            </div>
          </div>
        )}
      </AsyncBoundary>
    </div>
  );
}
