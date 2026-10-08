"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { statusRegistry } from "@/config/status-registry";
import { useMettreAJourEtape } from "../api/use-bookings";
import type { DossierStep } from "../api/schemas";
import { CLE_TRADUCTION_ETAPE, ORDRE_ETAPES } from "../lib/dossier-steps";

/**
 * Mise à jour des étapes du dossier par l'agence (ticket #52) —
 * `PATCH /bookings/:id/step`. Libellés de statut tirés du registre unique
 * (`CLAUDE.md` règle 10). L'étape `payment` est en lecture seule : le
 * backend la réconcilie avec les paiements confirmés.
 */
const ETAPE_PILOTEE_PAR_LES_PAIEMENTS = "payment";

const STATUTS: readonly DossierStep["status"][] = [
  "pending",
  "in_progress",
  "done",
];

export function BookingStepEditor({
  bookingId,
  steps,
}: Readonly<{ bookingId: string; steps: DossierStep[] }>) {
  const t = useTranslations("bookings");
  const miseAJour = useMettreAJourEtape(bookingId);
  const parCle = new Map(steps.map((s) => [s.key, s]));

  async function changer(
    key: DossierStep["key"],
    status: DossierStep["status"],
  ) {
    try {
      await miseAJour.mutateAsync({ key, status });
      toast.success(t("stepEditor.saved"));
    } catch {
      toast.error(t("stepEditor.error"));
    }
  }

  return (
    <div className="space-y-3">
      <p className="text-muted-foreground text-sm">{t("stepEditor.hint")}</p>
      <ul className="divide-y rounded-lg border">
        {ORDRE_ETAPES.map((cle) => {
          const libelle = t(CLE_TRADUCTION_ETAPE[cle]);
          const statut = parCle.get(cle)?.status ?? "pending";
          return (
            <li
              key={cle}
              className="flex items-center justify-between gap-4 px-4 py-3"
            >
              <span className="text-sm font-medium">{libelle}</span>
              {cle === ETAPE_PILOTEE_PAR_LES_PAIEMENTS ? (
                <span className="flex items-center gap-2">
                  <span className="text-muted-foreground hidden text-xs sm:inline">
                    {t("stepEditor.paymentAuto")}
                  </span>
                  <StatusBadge kind="dossierStep" value={statut} />
                </span>
              ) : (
                <select
                  aria-label={t("stepEditor.label", { step: libelle })}
                  value={statut}
                  disabled={miseAJour.isPending}
                  onChange={(e) => {
                    changer(cle, e.target.value as DossierStep["status"]).catch(
                      () => undefined,
                    );
                  }}
                  className="border-input bg-background h-(--size-field) rounded-md border px-3 text-sm"
                >
                  {STATUTS.map((valeur) => (
                    <option key={valeur} value={valeur}>
                      {statusRegistry.dossierStep[valeur].label}
                    </option>
                  ))}
                </select>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
