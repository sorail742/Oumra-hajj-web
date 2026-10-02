"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle } from "lucide-react";
import type { ExpiryAlert } from "../api/schemas";
import { useMyDocuments } from "../api/use-documents";
import {
  useExpiryAlerts,
  useExpiryAlertsForBookings,
} from "../api/use-expiry-alerts";
import { CLE_TRADUCTION_TYPE } from "../lib/document-type";
import { Can } from "@/components/shared/Can";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";

/**
 * Alertes d'expiration des pièces du pèlerin (ticket #57) : bandeau
 * discret, n'apparaît que s'il y a une action à mener — rien pendant le
 * chargement ni en cas d'erreur (l'écran principal porte déjà ces états).
 * Statuts et tons depuis le registre (`documentExpiry`, règle 10).
 */
function Bandeau({
  alertes,
  lienDepot,
}: Readonly<{ alertes: readonly ExpiryAlert[]; lienDepot?: string }>) {
  const t = useTranslations("documents");
  if (alertes.length === 0) {
    return null;
  }
  const critique = alertes.some((a) => a.status !== "expires_soon_after_trip");

  return (
    <section
      aria-labelledby="alertes-expiration"
      className={
        critique
          ? "border-state-danger/30 bg-state-danger-bg space-y-3 rounded-xl border p-4"
          : "border-state-warning/30 bg-state-warning-bg space-y-3 rounded-xl border p-4"
      }
    >
      <h2
        id="alertes-expiration"
        className="flex items-center gap-2 text-sm font-semibold"
      >
        <AlertTriangle aria-hidden className="size-4" />
        {t("expiry.title", { count: alertes.length })}
      </h2>
      <ul className="space-y-2">
        {alertes.map((alerte) => (
          <li
            key={alerte.id}
            className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm"
          >
            <StatusBadge kind="documentExpiry" value={alerte.status} />
            <span>
              {t("expiry.line", {
                type: t(CLE_TRADUCTION_TYPE[alerte.type]),
                date: formatDate(alerte.expiresAt),
              })}
            </span>
          </li>
        ))}
      </ul>
      <Can
        role="pilgrim"
        fallback={
          <p className="text-muted-foreground text-xs">
            {t("expiry.agencyHint")}
          </p>
        }
      >
        {lienDepot ? (
          <a
            href={lienDepot}
            className="text-primary inline-block text-sm font-medium hover:underline"
          >
            {t("expiry.action")}
          </a>
        ) : (
          <p className="text-muted-foreground text-xs">
            {t("expiry.pilgrimHint")}
          </p>
        )}
      </Can>
    </section>
  );
}

/** Détail d'une réservation : le formulaire de dépôt est sur la même page. */
export function BookingExpiryAlerts({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const { data } = useExpiryAlerts(bookingId);
  return <Bandeau alertes={data ?? []} lienDepot="#depot-pieces" />;
}

/** Écran `/documents` du pèlerin : alertes de tous ses dossiers. */
export function MyDocumentsExpiryAlerts() {
  const { data: documents } = useMyDocuments();
  const dossiers = [...new Set((documents ?? []).map((d) => d.bookingId))];
  const alertes = useExpiryAlertsForBookings(dossiers);
  return <Bandeau alertes={alertes} />;
}
