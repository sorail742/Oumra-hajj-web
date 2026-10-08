"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Accessibility, Download, HeartPulse, Utensils } from "lucide-react";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { formatTelephone } from "@/lib/format";
import {
  lienCsvListe,
  useGroupRoster,
  type GroupRosterMember,
} from "../api/use-group-roster";

/**
 * Liste du groupe (idée #41 backend) pour l'agence et le guide : joindre
 * chacun, voir où en est son dossier, anticiper ses besoins (idée #69).
 * Export CSV pour l'impression ou la compagnie aérienne.
 */
function Besoins({ membre }: Readonly<{ membre: GroupRosterMember }>) {
  const t = useTranslations("groups.roster");
  const besoins = membre.specialNeeds;
  const lignes = [
    besoins && besoins.mobility !== "none"
      ? { icone: Accessibility, texte: t(`mobility.${besoins.mobility}`) }
      : undefined,
    besoins?.dietary ? { icone: Utensils, texte: besoins.dietary } : undefined,
    besoins?.medical
      ? { icone: HeartPulse, texte: besoins.medical }
      : undefined,
    besoins?.assistance
      ? { icone: Accessibility, texte: besoins.assistance }
      : undefined,
  ].filter((l) => l !== undefined);

  if (lignes.length === 0) {
    return <span className="text-muted-foreground">{t("noNeeds")}</span>;
  }
  return (
    <ul className="space-y-1 whitespace-normal">
      {lignes.map(({ icone: Icone, texte }) => (
        <li key={texte} className="flex items-start gap-1.5">
          <Icone
            aria-hidden
            className="text-state-warning mt-0.5 size-3.5 shrink-0"
          />
          <span>{texte}</span>
        </li>
      ))}
    </ul>
  );
}

function Joindre({ membre }: Readonly<{ membre: GroupRosterMember }>) {
  return (
    <span className="space-y-0.5">
      <span className="block font-medium">{membre.fullName}</span>
      {membre.phone && (
        <span className="text-muted-foreground block font-mono text-xs">
          {formatTelephone(membre.phone)}
        </span>
      )}
    </span>
  );
}

function ContactUrgence({ membre }: Readonly<{ membre: GroupRosterMember }>) {
  const t = useTranslations("groups.roster");
  const contact = membre.emergencyContact;
  if (!contact) {
    return (
      <span className="text-state-warning">{t("noEmergencyContact")}</span>
    );
  }
  return (
    <span className="space-y-0.5">
      <span className="block">
        {contact.fullName}
        {contact.relationship ? ` (${contact.relationship})` : ""}
      </span>
      <span className="text-muted-foreground block font-mono text-xs">
        {formatTelephone(contact.phone)}
      </span>
    </span>
  );
}

export function GroupRoster({ groupId }: Readonly<{ groupId: string }>) {
  const t = useTranslations("groups.roster");
  const query = useGroupRoster(groupId);

  const colonnes: ColumnDef<GroupRosterMember>[] = useMemo(
    () => [
      {
        id: "membre",
        header: t("member"),
        cell: ({ row }) => <Joindre membre={row.original} />,
      },
      {
        id: "reservation",
        header: t("booking"),
        cell: ({ row }) =>
          row.original.bookingStatus ? (
            <StatusBadge kind="booking" value={row.original.bookingStatus} />
          ) : (
            <span className="text-muted-foreground">—</span>
          ),
      },
      {
        id: "urgence",
        header: t("emergencyContact"),
        cell: ({ row }) => <ContactUrgence membre={row.original} />,
      },
      {
        id: "besoins",
        header: t("needs"),
        cell: ({ row }) => <Besoins membre={row.original} />,
      },
    ],
    [t],
  );

  return (
    <section aria-labelledby="liste-groupe" className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 id="liste-groupe" className="text-lg font-medium">
            {t("title")}
          </h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        <Button variant="outline" asChild>
          <a href={lienCsvListe(groupId)} download>
            <Download aria-hidden />
            {t("download")}
          </a>
        </Button>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={4} />}
        isEmpty={(liste) => liste.members.length === 0}
        empty={
          <div className="bg-card rounded-lg border">
            <EmptyState
              title={t("emptyTitle")}
              description={t("emptyDescription")}
            />
          </div>
        }
      >
        {(liste) => (
          <DataTable
            data={liste.members}
            columns={colonnes}
            getRowId={(m) => m.userId}
            renderCard={(m) => (
              <div className="bg-card space-y-3 rounded-lg border p-4 text-sm">
                <div className="flex items-start justify-between gap-2">
                  <Joindre membre={m} />
                  {m.bookingStatus && (
                    <StatusBadge kind="booking" value={m.bookingStatus} />
                  )}
                </div>
                <ContactUrgence membre={m} />
                <Besoins membre={m} />
              </div>
            )}
          />
        )}
      </AsyncBoundary>
    </section>
  );
}
