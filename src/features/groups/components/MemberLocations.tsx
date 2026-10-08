"use client";

import { useTranslations } from "next-intl";
import Link from "next/link";
import { ExternalLink, Map as MapIcon } from "lucide-react";
import type { Group } from "../api/schemas";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { useUserId } from "@/lib/auth/role-context";

/**
 * Positions partagées volontairement par les membres et le guide (ticket
 * #85). La carte intégrée vit sur l'écran de suivi (ADR-0007), ouvert par
 * le lien de cette section ; chaque position s'ouvre aussi, à la demande,
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
  const tSuivi = useTranslations("groups.tracking");
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
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 className="text-lg font-medium">{t("listTitle")}</h2>
        <Link
          href={`/groups/${group.id}/tracking`}
          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          <MapIcon aria-hidden className="size-4" />
          {tSuivi("open")}
        </Link>
      </div>
      {positions.length === 0 ? (
        <p className="text-muted-foreground text-sm">{t("listEmpty")}</p>
      ) : (
        <ul className="bg-card divide-y rounded-lg border shadow-(--shadow-card)">
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
