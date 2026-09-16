"use client";

import { CheckCircle2, Circle, CircleDot } from "lucide-react";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { formatDate } from "@/lib/format";
import type { DossierStep } from "../api/schemas";

/**
 * Visualise le dossier comme une checklist ordonnée, pas un tableau — voir
 * `docs/design-system.md` §7 : c'est ce qu'un pèlerin anxieux regarde en
 * premier en ouvrant l'app.
 */
export interface BookingStepTrackerProps {
  steps: DossierStep[];
}

const ORDRE: DossierStep["key"][] = [
  "payment",
  "visa",
  "flight",
  "vaccination",
  "documents",
];

const ICONE_PAR_STATUT: Record<
  DossierStep["status"],
  { Icone: typeof CheckCircle2; classe: string }
> = {
  done: { Icone: CheckCircle2, classe: "text-state-success" },
  in_progress: { Icone: CircleDot, classe: "text-state-progress" },
  pending: { Icone: Circle, classe: "text-muted-foreground" },
};

const CLE_TRADUCTION: Record<DossierStep["key"], string> = {
  payment: "stepPayment",
  visa: "stepVisa",
  flight: "stepFlight",
  vaccination: "stepVaccination",
  documents: "stepDocuments",
};

export function BookingStepTracker({ steps }: BookingStepTrackerProps) {
  const t = useTranslations("bookings");
  const parCle = new Map(steps.map((s) => [s.key, s]));

  return (
    <ol className="space-y-3">
      {ORDRE.map((cle) => {
        const etape = parCle.get(cle);
        const statut = etape?.status ?? "pending";
        const { Icone, classe } = ICONE_PAR_STATUT[statut];

        return (
          <li key={cle} className="flex items-center gap-3">
            <Icone className={cn("size-5 shrink-0", classe)} aria-hidden />
            <span
              className={cn(
                "text-sm",
                statut === "done" && "text-muted-foreground line-through",
              )}
            >
              {t(CLE_TRADUCTION[cle])}
            </span>
            {etape?.completedAt ? (
              <span className="text-muted-foreground ml-auto text-xs">
                {formatDate(etape.completedAt)}
              </span>
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
