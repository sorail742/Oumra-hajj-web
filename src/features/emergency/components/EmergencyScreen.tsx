"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  Building2,
  Flame,
  HeartPulse,
  Landmark,
  Phone,
  ShieldAlert,
  UserRound,
} from "lucide-react";
import { toast } from "sonner";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Can } from "@/components/shared/Can";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { EmptyState } from "@/components/shared/EmptyState";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatPays, lienTelephone } from "@/lib/format";
import {
  useEmergencyNumbers,
  useMyEmergencyContacts,
  useSupprimerNumero,
} from "../api/use-emergency";
import type { EmergencyCategory, EmergencyNumber } from "../api/schemas";
import { EmergencyNumberFormDialog } from "./EmergencyNumberFormDialog";

/**
 * Numéros d'urgence (idée #21) : contacts personnels (agence, guide) puis
 * annuaire tenu par l'administration, groupé par pays. Chaque numéro est
 * un lien `tel:` à large zone tactile — composé en un geste sur mobile.
 */
const ICONE_PAR_CATEGORIE: Record<EmergencyCategory, LucideIcon> = {
  police: ShieldAlert,
  medical: HeartPulse,
  civil_defense: Flame,
  embassy: Landmark,
  other: Phone,
};

function BoutonAppel({ numero }: Readonly<{ numero: string }>) {
  return (
    <a
      href={lienTelephone(numero)}
      className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex h-(--size-touch) shrink-0 items-center gap-2 rounded-md px-4 font-mono text-sm font-semibold"
    >
      <Phone aria-hidden className="size-4" />
      {numero}
    </a>
  );
}

function CarteContact({
  icone: Icone,
  titre,
  detail,
  numero,
  sansNumero,
}: Readonly<{
  icone: LucideIcon;
  titre: string;
  detail: string;
  numero?: string;
  sansNumero: string;
}>) {
  return (
    <li className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 shadow-(--shadow-card)">
      <span className="flex min-w-0 items-center gap-3">
        <span className="bg-muted inline-flex size-10 shrink-0 items-center justify-center rounded-md">
          <Icone aria-hidden className="size-5" />
        </span>
        <span className="min-w-0">
          <span className="block truncate font-semibold">{titre}</span>
          <span className="text-muted-foreground block truncate text-sm">
            {detail}
          </span>
        </span>
      </span>
      {numero ? (
        <BoutonAppel numero={numero} />
      ) : (
        <span className="text-muted-foreground text-sm">{sansNumero}</span>
      )}
    </li>
  );
}

function MesContacts() {
  const t = useTranslations("emergency");
  const query = useMyEmergencyContacts();
  return (
    <section aria-labelledby="mes-contacts" className="space-y-3">
      <h2 id="mes-contacts" className="text-lg font-semibold">
        {t("mineTitle")}
      </h2>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-20 w-full" />}
        isEmpty={(c) => c.agencies.length === 0 && c.guides.length === 0}
        empty={
          <p className="text-muted-foreground text-sm">{t("mineEmpty")}</p>
        }
      >
        {(contacts) => (
          <ul className="grid gap-3 lg:grid-cols-2">
            {contacts.guides.map((g) => (
              <CarteContact
                key={g.groupId}
                icone={UserRound}
                titre={g.fullName}
                detail={t("guideOf", { group: g.groupTitle })}
                numero={g.phone}
                sansNumero={t("noPhone")}
              />
            ))}
            {contacts.agencies.map((a) => (
              <CarteContact
                key={a.agencyId}
                icone={Building2}
                titre={a.legalName}
                detail={t("yourAgency")}
                numero={a.phone}
                sansNumero={t("noPhone")}
              />
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </section>
  );
}

function ActionsAdmin({ numero }: Readonly<{ numero: EmergencyNumber }>) {
  const t = useTranslations("emergency.manage");
  const suppression = useSupprimerNumero(numero.id);
  return (
    <span className="flex gap-2">
      <EmergencyNumberFormDialog numero={numero} />
      <ConfirmDialog
        trigger={
          <Button variant="outline" size="sm">
            {t("delete")}
          </Button>
        }
        title={t("deleteTitle", { label: numero.label })}
        description={t("deleteBody")}
        confirmLabel={t("delete")}
        destructive
        enCours={suppression.isPending}
        onConfirm={() =>
          suppression.mutateAsync().then(
            () => toast.success(t("deleted")),
            (erreur: unknown) => {
              toast.error(t("error"));
              throw erreur;
            },
          )
        }
      />
    </span>
  );
}

function Annuaire() {
  const t = useTranslations("emergency");
  const tCat = useTranslations("emergency.category");
  const query = useEmergencyNumbers();

  return (
    <section aria-labelledby="annuaire-urgence" className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="annuaire-urgence" className="text-lg font-semibold">
          {t("directoryTitle")}
        </h2>
        <Can role="admin">
          <EmergencyNumberFormDialog />
        </Can>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-40 w-full" />}
        empty={
          <div className="bg-card rounded-lg border">
            <EmptyState
              title={t("directoryEmptyTitle")}
              description={t("directoryEmptyDescription")}
            />
          </div>
        }
      >
        {(numeros) => {
          const pays = [...new Set(numeros.map((n) => n.country))];
          return (
            <div className="space-y-6">
              {pays.map((code) => (
                <div key={code} className="space-y-3">
                  <h3 className="text-muted-foreground text-sm font-semibold tracking-wide uppercase">
                    {formatPays(code)}
                  </h3>
                  <ul className="grid gap-3 lg:grid-cols-2">
                    {numeros
                      .filter((n) => n.country === code)
                      .map((n) => (
                        <li
                          key={n.id}
                          className="bg-card space-y-3 rounded-lg border p-4 shadow-(--shadow-card)"
                        >
                          <div className="flex flex-wrap items-center justify-between gap-3">
                            <span className="flex min-w-0 items-center gap-3">
                              <NumeroIcone categorie={n.category} />
                              <span className="min-w-0">
                                <span className="block truncate font-semibold">
                                  {n.label}
                                </span>
                                <span className="text-muted-foreground block truncate text-sm">
                                  {[tCat(n.category), n.city]
                                    .filter(Boolean)
                                    .join(" · ")}
                                </span>
                              </span>
                            </span>
                            <BoutonAppel numero={n.phone} />
                          </div>
                          {n.notes && (
                            <p className="text-muted-foreground text-sm">
                              {n.notes}
                            </p>
                          )}
                          <Can role="admin">
                            <ActionsAdmin numero={n} />
                          </Can>
                        </li>
                      ))}
                  </ul>
                </div>
              ))}
            </div>
          );
        }}
      </AsyncBoundary>
    </section>
  );
}

function NumeroIcone({
  categorie,
}: Readonly<{ categorie: EmergencyCategory }>) {
  const Icone = ICONE_PAR_CATEGORIE[categorie];
  return (
    <span className="bg-state-danger-bg text-state-danger inline-flex size-10 shrink-0 items-center justify-center rounded-md">
      <Icone aria-hidden className="size-5" />
    </span>
  );
}

export function EmergencyScreen() {
  const t = useTranslations("emergency");
  return (
    <div className="space-y-8">
      <Can role="pilgrim">
        <p className="bg-state-danger-bg text-state-danger rounded-lg px-4 py-3 text-sm font-medium">
          {t("sosHint")}{" "}
          <Link href="/groups" className="underline underline-offset-2">
            {t("sosLink")}
          </Link>
        </p>
      </Can>
      <Can role={["pilgrim", "guide"]}>
        <MesContacts />
      </Can>
      <Annuaire />
    </div>
  );
}
