"use client";

import { useTranslations } from "next-intl";
import { Navigation, ShieldCheck, UserRound } from "lucide-react";
import { cn } from "cn";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCoordonnees } from "@/lib/format";
import {
  FILTRES_SUIVI,
  fraicheur,
  type FiltreSuivi,
  type PositionSuivie,
  type RolePosition,
} from "../../lib/suivi";

const ICONE_PAR_ROLE = {
  guide: ShieldCheck,
  moi: Navigation,
  membre: UserRound,
} as const satisfies Record<RolePosition, unknown>;

/**
 * Colonne de gauche du suivi : filtres (dans l'URL, règle 8) et une carte
 * par position — libellé, fraîcheur, dernière mise à jour, coordonnées.
 */
export function ListeSuivi({
  positions,
  total,
  filtre,
  onFiltre,
  selection,
  onSelect,
  libelle,
  maintenant,
}: Readonly<{
  positions: readonly PositionSuivie[];
  total: number;
  filtre: FiltreSuivi;
  onFiltre: (filtre: FiltreSuivi) => void;
  selection: string | undefined;
  onSelect: (id: string) => void;
  libelle: (p: PositionSuivie) => string;
  maintenant: number;
}>) {
  const t = useTranslations("groups.tracking");

  return (
    <section className="bg-card flex min-h-0 flex-col rounded-lg border shadow-(--shadow-card)">
      <div className="space-y-3 border-b p-4">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold">{t("listTitle")}</h2>
          <span className="bg-muted text-muted-foreground rounded-full px-2 py-0.5 text-xs">
            {t("count", { count: total })}
          </span>
        </div>
        <SegmentedControl
          label={t("filtersLabel")}
          options={FILTRES_SUIVI.map((f) => ({
            value: f,
            label: t(`filters.${f}`),
          }))}
          value={filtre}
          onChange={onFiltre}
          className="w-full [&>button]:h-8 [&>button]:flex-1 [&>button]:px-2"
        />
      </div>
      {positions.length === 0 ? (
        <p className="text-muted-foreground p-6 text-center text-sm">
          {t("filteredEmpty")}
        </p>
      ) : (
        <ul className="scrollbar-fine min-h-0 flex-1 space-y-2 overflow-y-auto p-3">
          {positions.map((p) => {
            const Icone = ICONE_PAR_ROLE[p.role];
            const choisi = p.userId === selection;
            return (
              <li key={p.userId}>
                <button
                  type="button"
                  onClick={() => onSelect(p.userId)}
                  aria-pressed={choisi}
                  className={cn(
                    "w-full space-y-2 rounded-lg border p-3 text-left transition-colors duration-(--motion-fast)",
                    choisi
                      ? "border-primary bg-primary-subtle/50"
                      : "hover:bg-muted/60 border-transparent",
                  )}
                >
                  <span className="flex items-center justify-between gap-2">
                    <span className="flex min-w-0 items-center gap-2">
                      <span className="bg-muted inline-flex size-7 shrink-0 items-center justify-center rounded-md">
                        <Icone aria-hidden className="size-4" />
                      </span>
                      <span className="truncate text-sm font-semibold">
                        {libelle(p)}
                      </span>
                    </span>
                    <StatusBadge
                      kind="locationFreshness"
                      value={fraicheur(p.updatedAt, maintenant)}
                    />
                  </span>
                  <span className="text-muted-foreground flex items-center justify-between gap-2 text-xs">
                    <span className="font-mono">
                      {formatCoordonnees(p.lat, p.lng)}
                    </span>
                    <RelativeTime iso={p.updatedAt} />
                  </span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
