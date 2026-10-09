"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Phone, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useCreneaux, useSupprimerCreneau } from "../api/use-on-call";
import type { OnCallShift } from "../api/schemas";
import { CoverageCard } from "./CoverageCard";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateHeure, formatTelephone, lienTelephone } from "@/lib/format";

/**
 * Planning d'astreinte de l'agence (idée #63) : créneaux à venir, filtrés
 * par forfait (dans l'URL, règle 8), et couverture du voyage choisi. Les
 * forfaits viennent de la page (règle 2).
 */
export function OnCallShiftsScreen({
  forfaits,
}: Readonly<{ forfaits: readonly { id: string; title: string }[] }>) {
  const t = useTranslations("onCall");
  const params = useSearchParams();
  const router = useRouter();
  const forfait = params.get("package") ?? undefined;
  const query = useCreneaux(forfait);

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
      {forfait && <CoverageCard packageId={forfait} />}
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-48 w-full" />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(creneaux) => (
          <ul className="space-y-3">
            {creneaux.map((c) => (
              <CreneauLigne key={c.id} creneau={c} />
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}

function CreneauLigne({ creneau }: Readonly<{ creneau: OnCallShift }>) {
  const t = useTranslations("onCall");
  const tr = useTranslations("onCall.roles");
  const suppression = useSupprimerCreneau();

  return (
    <li className="bg-card flex flex-wrap items-start justify-between gap-3 rounded-lg border p-4 shadow-(--shadow-card)">
      <div className="min-w-0 space-y-1">
        <p className="font-semibold">
          {creneau.staffName}{" "}
          <span className="text-muted-foreground text-sm font-normal">
            · {tr(creneau.staffRole)}
          </span>
        </p>
        <a
          href={lienTelephone(creneau.phone)}
          className="text-primary inline-flex items-center gap-1 font-mono text-sm"
        >
          <Phone aria-hidden className="size-4" />
          {formatTelephone(creneau.phone)}
        </a>
        <p className="text-sm tabular-nums">
          {t("period", {
            from: formatDateHeure(creneau.startsAt),
            to: formatDateHeure(creneau.endsAt),
          })}
        </p>
        <p className="text-muted-foreground text-sm">
          {creneau.packageTitle ?? t("allTrips")}
        </p>
        {creneau.notes && (
          <p className="text-muted-foreground text-sm">{creneau.notes}</p>
        )}
      </div>
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm">
            <Trash2 aria-hidden className="size-4" />
            {t("delete")}
          </Button>
        }
        title={t("deleteTitle")}
        description={t("deleteDescription", { name: creneau.staffName })}
        confirmLabel={t("delete")}
        destructive
        enCours={suppression.isPending}
        onConfirm={async () => {
          try {
            await suppression.mutateAsync(creneau.id);
            toast.success(t("deleted"));
          } catch (erreur) {
            toast.error(t("deleteError"));
            throw erreur;
          }
        }}
      />
    </li>
  );
}
