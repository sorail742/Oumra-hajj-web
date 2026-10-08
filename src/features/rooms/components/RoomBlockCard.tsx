"use client";

import { useTranslations } from "next-intl";
import { CalendarClock, Download, Trash2, X } from "lucide-react";
import { toast } from "sonner";
import {
  lienRoomingList,
  useLibererPlace,
  useSupprimerBloc,
} from "../api/use-rooms";
import type { RoomBlock } from "../api/schemas";
import { placesInvendues, retrocessionProche } from "../lib/allotement";
import { AssignRoomForm } from "./AssignRoomForm";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Un bloc de chambres (idée #40) : occupation, date de rétrocession, plan
 * des chambres avec leurs occupants, placement des réservations du
 * forfait et rooming list à transmettre à l'hôtel.
 */
export function RoomBlockCard({ bloc }: Readonly<{ bloc: RoomBlock }>) {
  const t = useTranslations("rooms.block");
  const tt = useTranslations("rooms.types");
  const liberation = useLibererPlace(bloc.id);
  const suppression = useSupprimerBloc();

  const invendus = placesInvendues(bloc);
  const taux = bloc.totalBeds === 0 ? 0 : bloc.assignedBeds / bloc.totalBeds;
  const alerte = retrocessionProche(bloc);

  async function liberer(bookingId: string) {
    try {
      await liberation.mutateAsync(bookingId);
    } catch {
      toast.error(t("unassignError"));
    }
  }

  return (
    <article className="bg-card space-y-4 rounded-lg border p-4 shadow-(--shadow-card) sm:p-5">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="font-semibold">{bloc.hotelName}</h3>
          <p className="text-muted-foreground text-sm">
            {t("subtitle", {
              city: bloc.city,
              type: tt(bloc.roomType),
              rooms: bloc.roomCount,
              package: bloc.packageTitle,
            })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" size="sm">
            <a href={lienRoomingList(bloc.id)} download>
              <Download aria-hidden className="size-4" />
              {t("roomingList")}
            </a>
          </Button>
          <ConfirmDialog
            trigger={
              <Button
                variant="outline"
                size="sm"
                disabled={bloc.assignedBeds > 0}
                title={bloc.assignedBeds > 0 ? t("deleteBlocked") : undefined}
              >
                <Trash2 aria-hidden className="size-4" />
                {t("delete")}
              </Button>
            }
            title={t("deleteTitle")}
            description={t("deleteDescription")}
            confirmLabel={t("delete")}
            destructive
            enCours={suppression.isPending}
            onConfirm={() => suppression.mutateAsync(bloc.id)}
          />
        </div>
      </header>

      <div className="space-y-2">
        <div className="flex flex-wrap items-baseline justify-between gap-2 text-sm">
          <span className="font-medium">
            {t("occupancy", {
              assigned: bloc.assignedBeds,
              total: bloc.totalBeds,
            })}
          </span>
          <span className="text-muted-foreground">
            {t("unsold", { count: invendus })}
          </span>
        </div>
        <div
          role="progressbar"
          aria-label={t("occupancyLabel")}
          aria-valuemin={0}
          aria-valuemax={bloc.totalBeds}
          aria-valuenow={bloc.assignedBeds}
          className="bg-muted h-2 overflow-hidden rounded-full"
        >
          <div
            className="bg-primary h-full rounded-full"
            style={{ width: `${Math.round(taux * 100)}%` }}
          />
        </div>
        {bloc.releaseDate && (
          <p
            className={cn(
              "flex items-center gap-2 text-sm",
              alerte
                ? "text-state-warning font-medium"
                : "text-muted-foreground",
            )}
          >
            <CalendarClock aria-hidden className="size-4" />
            {alerte
              ? t("releaseSoon", {
                  date: formatDate(bloc.releaseDate),
                  count: invendus,
                })
              : t("release", { date: formatDate(bloc.releaseDate) })}
          </p>
        )}
        {bloc.notes && (
          <p className="text-muted-foreground text-sm">{bloc.notes}</p>
        )}
      </div>

      <ul className="grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
        {bloc.rooms.map((chambre) => (
          <li key={chambre.number} className="rounded-md border p-3">
            <p className="text-muted-foreground mb-2 flex items-center justify-between text-xs font-medium">
              <span>{t("room", { number: chambre.number })}</span>
              <span className="font-mono">
                {chambre.occupants.length}/{bloc.bedsPerRoom}
              </span>
            </p>
            <ul className="space-y-1">
              {chambre.occupants.map((o) => (
                <li
                  key={o.bookingId}
                  className="flex items-center justify-between gap-2 text-sm"
                >
                  <span className="truncate">{o.pilgrimName}</span>
                  <button
                    type="button"
                    onClick={() => liberer(o.bookingId)}
                    aria-label={t("unassign", { name: o.pilgrimName })}
                    className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-7 shrink-0 items-center justify-center rounded-sm"
                  >
                    <X aria-hidden className="size-4" />
                  </button>
                </li>
              ))}
              {Array.from(
                { length: bloc.bedsPerRoom - chambre.occupants.length },
                (_, i) => (
                  <li
                    key={`libre-${i}`}
                    className="text-muted-foreground border-border rounded-sm border border-dashed px-2 py-0.5 text-xs"
                  >
                    {t("freeBed")}
                  </li>
                ),
              )}
            </ul>
          </li>
        ))}
      </ul>

      <AssignRoomForm bloc={bloc} />
    </article>
  );
}
