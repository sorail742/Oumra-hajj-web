"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { Button } from "@/components/ui/button";
import { ApiError } from "@/lib/api/types";
import { useRole } from "@/lib/auth/role-context";
import { useCreerReservation } from "../api/use-bookings";

/**
 * Action « Réserver » du détail d'un forfait (ticket #34) :
 * - pèlerin connecté : crée la réservation puis ouvre le dossier ;
 * - visiteur anonyme : renvoie vers la connexion SMS, retour sur ce forfait ;
 * - autre rôle : simple mention, le backend refuserait de toute façon (403).
 * Les refus sont distingués par statut HTTP, jamais par le texte du backend.
 */

function cleErreur(erreur: unknown): "unavailable" | "forbidden" | "error" {
  if (erreur instanceof ApiError) {
    if (erreur.statusCode === 409) return "unavailable";
    if (erreur.statusCode === 403) return "forbidden";
  }
  return "error";
}

function BoutonPelerin({
  packageId,
  reservable,
}: Readonly<{ packageId: string; reservable: boolean }>) {
  const t = useTranslations("bookings.reserve");
  const router = useRouter();
  const reservation = useCreerReservation();
  const [erreur, setErreur] = useState<string | null>(null);

  async function reserver() {
    setErreur(null);
    try {
      const nouvelle = await reservation.mutateAsync(packageId);
      router.push(`/bookings/${nouvelle.id}?nouvelle=1`);
    } catch (cause) {
      setErreur(t(cleErreur(cause)));
    }
  }

  if (!reservable) {
    return <p className="text-muted-foreground text-sm">{t("closed")}</p>;
  }

  return (
    <div className="space-y-3">
      <Button
        type="button"
        onClick={() => {
          reserver().catch(() => undefined);
        }}
        disabled={reservation.isPending}
        className="bg-primary hover:bg-primary-hover h-(--size-touch) w-full text-base"
      >
        {reservation.isPending ? (
          <>
            <Loader2 aria-hidden className="size-4 animate-spin" />
            {t("pending")}
          </>
        ) : (
          t("action")
        )}
      </Button>
      {erreur && (
        <p
          role="alert"
          className="bg-state-danger-bg text-state-danger rounded-md px-3 py-2 text-sm"
        >
          {erreur}
        </p>
      )}
    </div>
  );
}

export function ReserveButton({
  packageId,
  reservable,
}: Readonly<{ packageId: string; reservable: boolean }>) {
  const t = useTranslations("bookings.reserve");
  const role = useRole();

  if (!role) {
    return (
      <div className="space-y-2">
        <Link
          href={`/otp?next=${encodeURIComponent(`/packages/${packageId}`)}`}
          className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex h-(--size-touch) w-full items-center justify-center gap-2 rounded-md text-base font-medium"
        >
          <Lock aria-hidden className="size-4" />
          {t("loginToBook")}
        </Link>
        <p className="text-muted-foreground text-center text-xs">
          {t("loginHint")}
        </p>
      </div>
    );
  }

  return (
    <Can
      role="pilgrim"
      fallback={
        <p className="text-muted-foreground text-sm">{t("pilgrimOnly")}</p>
      }
    >
      <BoutonPelerin packageId={packageId} reservable={reservable} />
    </Can>
  );
}
