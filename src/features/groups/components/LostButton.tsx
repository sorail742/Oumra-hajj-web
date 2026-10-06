"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Compass } from "lucide-react";
import { toast } from "sonner";
import { useJeSuisPerdu } from "../api/use-groups";
import { Button } from "@/components/ui/button";

/**
 * « Je suis perdu » en un geste (ticket #14) : le geste vaut consentement
 * pour un envoi unique de la position, qui prévient le guide dans
 * l'application (pas de SMS, contrairement au SOS). Aucune coordonnée
 * n'est journalisée.
 */
export function LostButton({ groupId }: Readonly<{ groupId: string }>) {
  const t = useTranslations("groups.lost");
  const perdu = useJeSuisPerdu(groupId);
  const [localisation, setLocalisation] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  function signaler() {
    setErreur(null);
    if (!("geolocation" in navigator)) {
      setErreur(t("unavailable"));
      return;
    }
    setLocalisation(true);
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setLocalisation(false);
        perdu.mutate(
          { lat: coords.latitude, lng: coords.longitude },
          {
            onSuccess: () => toast.success(t("sent")),
            onError: () => setErreur(t("error")),
          },
        );
      },
      (e) => {
        setLocalisation(false);
        setErreur(
          e.code === e.PERMISSION_DENIED ? t("denied") : t("unavailable"),
        );
      },
      { enableHighAccuracy: true, timeout: 15_000, maximumAge: 0 },
    );
  }

  const enCours = localisation || perdu.isPending;
  return (
    <div className="space-y-1">
      <Button variant="outline" onClick={signaler} disabled={enCours}>
        <Compass aria-hidden className="size-4" />
        {enCours ? t("sending") : t("button")}
      </Button>
      <p className="text-muted-foreground text-xs">{t("hint")}</p>
      {erreur && (
        <p role="alert" className="text-state-danger text-sm">
          {erreur}
        </p>
      )}
    </div>
  );
}
