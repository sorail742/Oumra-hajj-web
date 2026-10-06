"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { MapPin, MapPinOff } from "lucide-react";
import { toast } from "sonner";
import { useArreterPartage, useEnvoyerPosition } from "../api/use-groups";
import { Button } from "@/components/ui/button";

/**
 * Partage volontaire de sa position avec le groupe (ticket #85).
 * Consentement explicite à chaque visite : rien n'est mémorisé, le partage
 * s'arrête en quittant la page. Envoi limité à une position par minute.
 * « Arrêter » efface aussi la dernière position côté serveur. Aucune
 * coordonnée n'est journalisée.
 */
const INTERVALLE_ENVOI_MS = 60_000;

type Etat = "inactif" | "actif" | "refuse" | "indisponible";

export function LocationSharingCard({
  groupId,
}: Readonly<{ groupId: string }>) {
  const t = useTranslations("groups.location");
  const envoi = useEnvoyerPosition(groupId);
  const arret = useArreterPartage(groupId);
  const [etat, setEtat] = useState<Etat>("inactif");
  const surveillance = useRef<number | null>(null);
  const dernierEnvoi = useRef(0);
  const { mutate: envoyer } = envoi;

  function couperSurveillance() {
    if (surveillance.current !== null) {
      navigator.geolocation.clearWatch(surveillance.current);
      surveillance.current = null;
    }
  }

  useEffect(() => couperSurveillance, []);

  function demarrer() {
    if (!("geolocation" in navigator)) {
      setEtat("indisponible");
      return;
    }
    dernierEnvoi.current = 0;
    setEtat("actif");
    surveillance.current = navigator.geolocation.watchPosition(
      ({ coords }) => {
        const maintenant = Date.now();
        if (maintenant - dernierEnvoi.current < INTERVALLE_ENVOI_MS) return;
        dernierEnvoi.current = maintenant;
        envoyer(
          { lat: coords.latitude, lng: coords.longitude },
          { onError: () => toast.error(t("sendError")) },
        );
      },
      (erreur) => {
        couperSurveillance();
        setEtat(
          erreur.code === erreur.PERMISSION_DENIED ? "refuse" : "indisponible",
        );
      },
      { enableHighAccuracy: false, maximumAge: 30_000 },
    );
  }

  function arreter() {
    couperSurveillance();
    setEtat("inactif");
    arret.mutate(undefined, {
      onSuccess: () => toast.success(t("stopped")),
      onError: () => toast.error(t("stopError")),
    });
  }

  return (
    <section className="bg-card space-y-3 rounded-xl border p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("consent")}</p>
      </div>
      {etat === "actif" ? (
        <div className="flex flex-wrap items-center gap-3">
          <output className="text-state-success flex items-center gap-2 text-sm font-medium">
            <MapPin aria-hidden className="size-4" />
            {t("active")}
          </output>
          <Button variant="outline" onClick={arreter}>
            <MapPinOff aria-hidden className="size-4" />
            {t("stop")}
          </Button>
        </div>
      ) : (
        <Button onClick={demarrer}>
          <MapPin aria-hidden className="size-4" />
          {t("start")}
        </Button>
      )}
      {etat === "refuse" && (
        <p role="alert" className="text-state-danger text-sm">
          {t("denied")}
        </p>
      )}
      {etat === "indisponible" && (
        <p role="alert" className="text-state-danger text-sm">
          {t("unavailable")}
        </p>
      )}
    </section>
  );
}
