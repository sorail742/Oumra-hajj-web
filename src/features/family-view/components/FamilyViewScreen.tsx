"use client";

import type { ReactNode } from "react";
import { useTranslations } from "next-intl";
import { MapPin, Route } from "lucide-react";
import { useFamilyView, type FamilyView } from "../api/use-family-view";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types";
import { formatDate } from "@/lib/format";

/**
 * Page du proche (ticket #75), en lecture seule : avancement du dossier,
 * dernière étape d'itinéraire, dernière position **partagée** — jamais
 * fabriquée, absente si le pèlerin n'a rien partagé. Les étapes du
 * dossier sont rendues par la page (`etapes`, règle 2).
 */
function Bloc({
  titre,
  icone,
  children,
}: Readonly<{ titre: string; icone: ReactNode; children: ReactNode }>) {
  return (
    <section className="bg-card space-y-2 rounded-xl border p-5">
      <h2 className="flex items-center gap-2 text-sm font-semibold">
        {icone}
        {titre}
      </h2>
      {children}
    </section>
  );
}

export function FamilyViewScreen({
  token,
  etapes,
}: Readonly<{
  token: string;
  etapes: (steps: FamilyView["steps"]) => ReactNode;
}>) {
  const t = useTranslations("familyView");
  const query = useFamilyView(token);
  const invalide =
    query.error instanceof ApiError && query.error.statusCode === 404;

  if (invalide) {
    return (
      <EmptyState title={t("invalidTitle")} description={t("invalidBody")} />
    );
  }
  return (
    <AsyncBoundary
      query={query}
      isEmpty={() => false}
      skeleton={<Skeleton className="h-64 w-full" />}
    >
      {(vue) => (
        <div className="space-y-5">
          <div className="space-y-2">
            <p className="text-muted-foreground text-sm">{t("intro")}</p>
            <h1 className="text-2xl font-semibold tracking-tight">
              {vue.pilgrimFullName}
            </h1>
            <div className="flex flex-wrap items-center gap-2 text-sm">
              <span>{vue.packageTitle}</span>
              <StatusBadge kind="booking" value={vue.status} />
            </div>
          </div>
          {vue.latestItineraryStep && (
            <Bloc
              titre={t("latestStep")}
              icone={<Route aria-hidden className="text-primary size-4" />}
            >
              <p className="text-sm">
                {vue.latestItineraryStep.label} —{" "}
                {formatDate(vue.latestItineraryStep.date)}
                {vue.latestItineraryStep.location
                  ? ` · ${vue.latestItineraryStep.location}`
                  : ""}
              </p>
            </Bloc>
          )}
          <Bloc
            titre={t("location")}
            icone={<MapPin aria-hidden className="text-primary size-4" />}
          >
            {vue.location ? (
              <p className="space-x-2 text-sm">
                <span>
                  {t("locationShared")}{" "}
                  <RelativeTime iso={vue.location.updatedAt} />.
                </span>
                <a
                  href={`https://www.openstreetmap.org/?mlat=${vue.location.lat}&mlon=${vue.location.lng}#map=16/${vue.location.lat}/${vue.location.lng}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary font-medium hover:underline"
                >
                  {t("openMap")}
                </a>
              </p>
            ) : (
              <p className="text-muted-foreground text-sm">{t("noLocation")}</p>
            )}
          </Bloc>
          <section className="space-y-3">
            <h2 className="text-lg font-medium">{t("dossier")}</h2>
            {etapes(vue.steps)}
          </section>
          <p className="text-muted-foreground text-xs">{t("privacy")}</p>
        </div>
      )}
    </AsyncBoundary>
  );
}
