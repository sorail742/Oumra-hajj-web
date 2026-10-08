"use client";

import { useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import { cn } from "cn";
import { CopyButton } from "@/components/shared/CopyButton";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatCoordonnees, formatDate, formatDistance } from "@/lib/format";
import type { Group } from "../../api/schemas";
import {
  distanceMetres,
  fraicheur,
  type PositionSuivie,
} from "../../lib/suivi";

const ONGLETS = ["overview", "itinerary"] as const;
type Onglet = (typeof ONGLETS)[number];

/** Lien OpenStreetMap — repli quand la carte intégrée est indisponible. */
function lienOsm(lat: number, lng: number): string {
  const params = new URLSearchParams({ mlat: String(lat), mlon: String(lng) });
  return `https://www.openstreetmap.org/?${params.toString()}#map=17/${lat}/${lng}`;
}

/**
 * Panneau sous la carte : la position sélectionnée (fraîcheur, heure,
 * coordonnées, distance au guide) et l'itinéraire du groupe.
 */
export function DetailSuivi({
  position,
  libelle,
  guide,
  itineraire,
  maintenant,
}: Readonly<{
  position: PositionSuivie | undefined;
  libelle: string;
  guide: PositionSuivie | undefined;
  itineraire: Group["itinerary"];
  maintenant: number;
}>) {
  const t = useTranslations("groups.tracking");
  const tGroupes = useTranslations("groups");
  const tPosition = useTranslations("groups.location");
  const [onglet, setOnglet] = useState<Onglet>("overview");
  const etapes = [...itineraire].sort((a, b) => a.date.localeCompare(b.date));

  return (
    <section className="bg-card rounded-lg border shadow-(--shadow-card)">
      <div
        role="tablist"
        aria-label={t("tabsLabel")}
        className="flex gap-4 border-b px-4"
      >
        {ONGLETS.map((o) => (
          <button
            key={o}
            type="button"
            role="tab"
            id={`onglet-${o}`}
            aria-selected={onglet === o}
            aria-controls={`panneau-${o}`}
            onClick={() => setOnglet(o)}
            className={cn(
              "-mb-px border-b-2 py-3 text-sm font-medium transition-colors duration-(--motion-fast)",
              onglet === o
                ? "border-primary text-foreground"
                : "text-muted-foreground hover:text-foreground border-transparent",
            )}
          >
            {t(`tabs.${o}`)}
          </button>
        ))}
      </div>

      <div
        role="tabpanel"
        id={`panneau-${onglet}`}
        aria-labelledby={`onglet-${onglet}`}
        className="p-4"
      >
        {onglet === "itinerary" ? (
          etapes.length === 0 ? (
            <p className="text-muted-foreground text-sm">
              {tGroupes("itineraryEmptyTitle")}
            </p>
          ) : (
            <ol className="space-y-2">
              {etapes.map((e) => (
                <li
                  key={`${e.date}-${e.label}`}
                  className="flex items-baseline gap-3 text-sm"
                >
                  <span className="font-mono text-xs whitespace-nowrap">
                    {formatDate(e.date)}
                  </span>
                  <span>{e.label}</span>
                  {e.location ? (
                    <span className="text-muted-foreground text-xs">
                      — {e.location}
                    </span>
                  ) : null}
                </li>
              ))}
            </ol>
          )
        ) : !position ? (
          <p className="text-muted-foreground text-sm">{t("selectPrompt")}</p>
        ) : (
          <div className="space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <h2 className="text-lg font-semibold">{libelle}</h2>
                <StatusBadge
                  kind="locationFreshness"
                  value={fraicheur(position.updatedAt, maintenant)}
                />
              </div>
              <a
                href={lienOsm(position.lat, position.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
              >
                {tPosition("openMap")}
                <ExternalLink aria-hidden className="size-3.5" />
                <span className="sr-only">{tPosition("newTab")}</span>
              </a>
            </div>
            <dl className="grid gap-px overflow-hidden rounded-md border bg-border sm:grid-cols-3">
              <Fait terme={t("updated")}>
                <RelativeTime iso={position.updatedAt} />
              </Fait>
              <Fait terme={t("coordinates")}>
                <span className="inline-flex items-center gap-1">
                  <span className="font-mono">
                    {formatCoordonnees(position.lat, position.lng)}
                  </span>
                  <CopyButton
                    value={formatCoordonnees(position.lat, position.lng)}
                    label={t("copyCoordinates")}
                  />
                </span>
              </Fait>
              <Fait terme={t("distanceGuide")}>
                {position.role === "guide"
                  ? t("isGuide")
                  : guide
                    ? formatDistance(distanceMetres(guide, position))
                    : t("guideNotLocated")}
              </Fait>
            </dl>
          </div>
        )}
      </div>
    </section>
  );
}

function Fait({
  terme,
  children,
}: Readonly<{ terme: string; children: ReactNode }>) {
  return (
    <div className="bg-card space-y-1 p-3">
      <dt className="text-muted-foreground text-xs">{terme}</dt>
      <dd className="text-sm font-medium">{children}</dd>
    </div>
  );
}
