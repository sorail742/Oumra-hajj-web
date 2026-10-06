"use client";

import { useTranslations } from "next-intl";
import { ExternalLink } from "lucide-react";
import type { Group } from "../api/schemas";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { useUserId } from "@/lib/auth/role-context";

/**
 * Positions partagées volontairement par les membres et le guide (ticket
 * #85). Pas de carte intégrée : une bibliothèque cartographique demande un
 * ADR (règle 11). Chaque position s'ouvre, à la demande de l'utilisateur,
 * sur OpenStreetMap. Les coordonnées ne sont jamais journalisées.
 */
function lienCarte(lat: number, lng: number): string {
  const params = new URLSearchParams({
    mlat: lat.toString(),
    mlon: lng.toString(),
  });
  return `https://www.openstreetmap.org/?${params.toString()}#map=17/${lat}/${lng}`;
}

export function MemberLocations({ group }: Readonly<{ group: Group }>) {
  const t = useTranslations("groups.location");
  const userId = useUserId();
  const positions = [...group.locations].sort((a, b) =>
    b.updatedAt.localeCompare(a.updatedAt),
  );
  const libelles = new Map<string, string>();
  let numero = 0;
  for (const p of positions) {
    if (p.userId === userId) {
      libelles.set(p.userId, t("you"));
    } else if (p.userId === group.guideId) {
      libelles.set(p.userId, t("guide"));
    } else {
      numero += 1;
      libelles.set(p.userId, t("member", { n: numero }));
    }
  }

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">{t("listTitle")}</h2>
      {positions.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("listEmpty")}</p>
      ) : (
        <ul className="divide-y rounded-lg border">
          {positions.map((p) => (
            <li
              key={p.userId}
              className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
            >
              <span className="font-medium">{libelles.get(p.userId)}</span>
              <span className="text-muted-foreground text-xs">
                <RelativeTime iso={p.updatedAt} />
              </span>
              <a
                href={lienCarte(p.lat, p.lng)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary inline-flex items-center gap-1 hover:underline"
              >
                {t("openMap")}
                <ExternalLink aria-hidden className="size-3.5" />
                <span className="sr-only">{t("newTab")}</span>
              </a>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
