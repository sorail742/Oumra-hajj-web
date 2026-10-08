"use client";

import { useId, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, Users } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useRattacherGroupe } from "../api/use-bookings";

/**
 * Rattachement d'une réservation à un groupe par l'agence (ticket #54).
 * Les groupes proposés — ceux de l'agence pour le même forfait — sont
 * fournis par la page (règle 2).
 *
 * Rattachement **initial seulement** : côté backend, changer de groupe
 * ajoute le pèlerin au nouveau sans le retirer de l'ancien
 * (`GroupsService.addMember`). Une fois rattachée, la réservation affiche
 * son groupe sans proposer de le changer.
 */
export interface GroupeOption {
  id: string;
  label: string;
}

export function BookingGroupAssign({
  bookingId,
  groupId,
  groupes,
}: Readonly<{
  bookingId: string;
  groupId: string | undefined;
  groupes: readonly GroupeOption[];
}>) {
  const t = useTranslations("bookings.group");
  const id = useId();
  const [choix, setChoix] = useState("");
  const rattachement = useRattacherGroupe(bookingId);

  let contenu;
  if (groupId) {
    const groupe = groupes.find((g) => g.id === groupId);
    contenu = (
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm">
          {groupe
            ? t("attached", { group: groupe.label })
            : t("attachedUnknown")}
        </p>
        <Link
          href={`/groups/${groupId}`}
          className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
        >
          {t("openGroup")}
          <ArrowRight aria-hidden className="size-4" />
        </Link>
      </div>
    );
  } else if (groupes.length === 0) {
    contenu = (
      <p className="text-muted-foreground text-sm">
        {t("noGroup")}{" "}
        <Link href="/groups" className="text-primary hover:underline">
          {t("createGroup")}
        </Link>
      </p>
    );
  } else {
    contenu = (
      <form
        className="space-y-3"
        onSubmit={(evenement) => {
          evenement.preventDefault();
          if (!choix) return;
          rattachement
            .mutateAsync(choix)
            .then(() => toast.success(t("success")))
            .catch(() => toast.error(t("error")));
        }}
      >
        <div className="flex flex-wrap items-end gap-2">
          <div className="space-y-1">
            <label htmlFor={id} className="block text-sm font-medium">
              {t("label")}
            </label>
            <select
              id={id}
              value={choix}
              onChange={(e) => setChoix(e.target.value)}
              className="border-input bg-background h-(--size-field) min-w-56 rounded-md border px-3 text-sm"
            >
              <option value="" disabled>
                {t("placeholder")}
              </option>
              {groupes.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.label}
                </option>
              ))}
            </select>
          </div>
          <Button type="submit" disabled={!choix || rattachement.isPending}>
            {t("submit")}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">{t("definitive")}</p>
      </form>
    );
  }

  return (
    <section className="bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)">
      <div className="flex items-start gap-3">
        <span className="bg-muted inline-flex size-9 shrink-0 items-center justify-center rounded-md">
          <Users aria-hidden className="size-4" />
        </span>
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
      </div>
      {contenu}
    </section>
  );
}
