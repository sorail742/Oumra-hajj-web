"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { usePlacerReservation } from "../api/use-rooms";
import type { RoomBlock } from "../api/schemas";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";

const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";
const PREMIERE_LIBRE = "";

/**
 * Placement d'une réservation du forfait dans le bloc : la première
 * chambre qui a de la place, ou une chambre choisie parmi celles qui en
 * ont encore. Le backend revérifie la capacité sous verrou.
 */
export function AssignRoomForm({ bloc }: Readonly<{ bloc: RoomBlock }>) {
  const t = useTranslations("rooms.assign");
  const placement = usePlacerReservation(bloc.id);
  const [reservation, setReservation] = useState("");
  const [chambre, setChambre] = useState(PREMIERE_LIBRE);

  const libres = bloc.rooms.filter(
    (r) => r.occupants.length < bloc.bedsPerRoom,
  );
  const complet = libres.length === 0;

  if (bloc.unassigned.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("nobodyLeft")}</p>;
  }

  async function placer(e: FormEvent) {
    e.preventDefault();
    if (!reservation) return;
    try {
      await placement.mutateAsync({
        bookingId: reservation,
        ...(chambre && { roomNumber: Number(chambre) }),
      });
      toast.success(t("done"));
      setReservation("");
      setChambre(PREMIERE_LIBRE);
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <form
      onSubmit={placer}
      className="grid gap-3 sm:grid-cols-[1fr_12rem_auto] sm:items-end"
    >
      <div className="space-y-1">
        <Label htmlFor={`placer-${bloc.id}`}>{t("pilgrim")}</Label>
        <select
          id={`placer-${bloc.id}`}
          value={reservation}
          onChange={(e) => setReservation(e.target.value)}
          className={SELECT}
        >
          <option value="">
            {t("pilgrimPlaceholder", { count: bloc.unassigned.length })}
          </option>
          {bloc.unassigned.map((o) => (
            <option key={o.bookingId} value={o.bookingId}>
              {o.pilgrimName}
            </option>
          ))}
        </select>
      </div>
      <div className="space-y-1">
        <Label htmlFor={`chambre-${bloc.id}`}>{t("room")}</Label>
        <select
          id={`chambre-${bloc.id}`}
          value={chambre}
          onChange={(e) => setChambre(e.target.value)}
          className={SELECT}
          disabled={complet}
        >
          <option value={PREMIERE_LIBRE}>{t("firstFree")}</option>
          {libres.map((r) => (
            <option key={r.number} value={String(r.number)}>
              {t("roomOption", {
                number: r.number,
                free: bloc.bedsPerRoom - r.occupants.length,
              })}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        disabled={!reservation || complet || placement.isPending}
      >
        {complet ? t("full") : t("submit")}
      </Button>
    </form>
  );
}
