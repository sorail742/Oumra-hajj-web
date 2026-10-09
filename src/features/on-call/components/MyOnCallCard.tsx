"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Phone, PhoneCall } from "lucide-react";
import { useAstreinteReservation } from "../api/use-on-call";
import type { OnCallContact } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDateHeure, formatTelephone, lienTelephone } from "@/lib/format";

/**
 * Qui appeler maintenant (idée #63), pour une réservation du pèlerin —
 * choisie dans l'URL quand il en a plusieurs (règle 8). Les réservations
 * viennent de la page (règle 2).
 */
export function MyOnCallCard({
  reservations,
}: Readonly<{ reservations: readonly { id: string; libelle: string }[] }>) {
  const t = useTranslations("onCall.mine");
  const params = useSearchParams();
  const router = useRouter();
  const choisie =
    reservations.find((r) => r.id === params.get("booking"))?.id ??
    reservations[0]?.id;

  if (!choisie) {
    return (
      <EmptyState title={t("noBookingTitle")} description={t("noBooking")} />
    );
  }

  function choisir(valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    suivant.set("booking", valeur);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  return (
    <div className="space-y-4">
      {reservations.length > 1 && (
        <div className="max-w-sm space-y-1">
          <Label htmlFor="choix-reservation">{t("booking")}</Label>
          <select
            id="choix-reservation"
            value={choisie}
            onChange={(e) => choisir(e.target.value)}
            className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
          >
            {reservations.map((r) => (
              <option key={r.id} value={r.id}>
                {r.libelle}
              </option>
            ))}
          </select>
        </div>
      )}
      <Contacts bookingId={choisie} />
    </div>
  );
}

function Contacts({ bookingId }: Readonly<{ bookingId: string }>) {
  const t = useTranslations("onCall.mine");
  const query = useAstreinteReservation(bookingId);

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-40 w-full" />}
      isEmpty={() => false}
    >
      {(vue) => (
        <div className="space-y-4">
          {vue.current.length > 0 ? (
            <ul className="grid gap-4 sm:grid-cols-2">
              {vue.current.map((c) => (
                <li key={`${c.phone}-${c.startsAt}`}>
                  <ContactCard contact={c} titre={t("now")} />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-warning text-sm font-medium">{t("nobodyNow")}</p>
          )}
          {vue.next && (
            <ContactCard contact={vue.next} titre={t("next")} discret />
          )}
          <p className="text-muted-foreground text-sm">
            {t("agencyFallback", { agency: vue.agencyName })}{" "}
            <a
              href={lienTelephone(vue.agencyPhone)}
              className="text-primary font-mono"
            >
              {formatTelephone(vue.agencyPhone)}
            </a>
          </p>
        </div>
      )}
    </AsyncBoundary>
  );
}

function ContactCard({
  contact,
  titre,
  discret = false,
}: Readonly<{ contact: OnCallContact; titre: string; discret?: boolean }>) {
  const t = useTranslations("onCall.mine");
  const tr = useTranslations("onCall.roles");
  return (
    <section className="bg-card space-y-3 rounded-lg border p-5 shadow-(--shadow-card)">
      <p className="text-muted-foreground text-sm font-medium">{titre}</p>
      <div>
        <p className="font-semibold">{contact.staffName}</p>
        <p className="text-muted-foreground text-sm">
          {tr(contact.staffRole)} ·{" "}
          {t("until", {
            from: formatDateHeure(contact.startsAt),
            to: formatDateHeure(contact.endsAt),
          })}
        </p>
      </div>
      <Button asChild variant={discret ? "outline" : "default"}>
        <a href={lienTelephone(contact.phone)}>
          {discret ? (
            <Phone aria-hidden className="size-4" />
          ) : (
            <PhoneCall aria-hidden className="size-4" />
          )}
          <span className="font-mono">
            {t("call", { phone: formatTelephone(contact.phone) })}
          </span>
        </a>
      </Button>
    </section>
  );
}
