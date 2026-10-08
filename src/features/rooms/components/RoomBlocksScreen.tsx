"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { useBlocsChambres } from "../api/use-rooms";
import { RoomBlockCard } from "./RoomBlockCard";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatCard, StatGrid } from "@/components/shared/StatCard";
import { Skeleton } from "@/components/ui/skeleton";
import { Label } from "@/components/ui/label";

/**
 * Allotement de l'agence (idée #40) : blocs de chambres, filtrés par
 * forfait (dans l'URL, règle 8). Les forfaits viennent de la page.
 */
export function RoomBlocksScreen({
  forfaits,
}: Readonly<{ forfaits: readonly { id: string; title: string }[] }>) {
  const t = useTranslations("rooms");
  const params = useSearchParams();
  const router = useRouter();
  const forfait = params.get("package") ?? undefined;
  const query = useBlocsChambres(forfait);

  function choisir(valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set("package", valeur);
    else suivant.delete("package");
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-6">
      <div className="max-w-sm space-y-1">
        <Label htmlFor="filtre-forfait">{t("filterPackage")}</Label>
        <select
          id="filtre-forfait"
          value={forfait ?? ""}
          onChange={(e) => choisir(e.target.value)}
          className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
        >
          <option value="">{t("allPackages")}</option>
          {forfaits.map((f) => (
            <option key={f.id} value={f.id}>
              {f.title}
            </option>
          ))}
        </select>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-72 w-full" />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(blocs) => {
          const total = blocs.reduce((s, b) => s + b.totalBeds, 0);
          const places = blocs.reduce((s, b) => s + b.assignedBeds, 0);
          const aPlacer = new Set(
            blocs.flatMap((b) => b.unassigned.map((u) => u.bookingId)),
          ).size;
          return (
            <div className="space-y-6">
              <StatGrid columns={3}>
                <StatCard title={t("statBeds")} value={total} />
                <StatCard title={t("statAssigned")} value={places} />
                <StatCard title={t("statUnsold")} value={total - places} />
              </StatGrid>
              {aPlacer > 0 && (
                <p className="text-muted-foreground text-sm">
                  {t("toPlace", { count: aPlacer })}
                </p>
              )}
              <div className="space-y-4">
                {blocs.map((bloc) => (
                  <RoomBlockCard key={bloc.id} bloc={bloc} />
                ))}
              </div>
            </div>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
