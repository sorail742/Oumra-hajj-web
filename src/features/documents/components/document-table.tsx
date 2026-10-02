"use client";

import type { ReactNode } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { formatDate } from "@/lib/format";
import type { PilgrimDocument } from "../api/schemas";
import { CLE_TRADUCTION_TYPE } from "../lib/document-type";

type Traduction = ReturnType<typeof useTranslations<"documents">>;

/**
 * Colonnes communes aux listes de documents (pèlerin et revue agence) :
 * type, statut, échéance (option), motif de refus, puis actions propres à
 * l'écran.
 */
export function colonnesDocument(
  t: Traduction,
  options: {
    avecExpiration: boolean;
    actions: (document: PilgrimDocument) => ReactNode;
  },
): ColumnDef<PilgrimDocument>[] {
  return [
    {
      accessorKey: "type",
      header: t("columnType"),
      cell: ({ row }) => t(CLE_TRADUCTION_TYPE[row.original.type]),
    },
    {
      accessorKey: "status",
      header: t("columnStatus"),
      cell: ({ row }) => (
        <StatusBadge kind="document" value={row.original.status} />
      ),
    },
    ...(options.avecExpiration
      ? [
          {
            id: "expiresAt",
            header: t("review.columnExpiresAt"),
            cell: ({ row }) =>
              row.original.expiresAt
                ? formatDate(row.original.expiresAt)
                : t("review.noExpiry"),
          } satisfies ColumnDef<PilgrimDocument>,
        ]
      : []),
    {
      id: "rejectionReason",
      header: t("columnRejectionReason"),
      cell: ({ row }) => row.original.rejectionReason ?? null,
    },
    {
      id: "actions",
      header: "",
      cell: ({ row }) => options.actions(row.original),
    },
  ];
}

/** Carte mobile (sous `md`) d'un document — même contenu que les colonnes. */
export function DocumentCard({
  document,
  avecExpiration,
  children,
}: {
  document: PilgrimDocument;
  avecExpiration: boolean;
  children: ReactNode;
}) {
  const t = useTranslations("documents");
  return (
    <div className="space-y-2 rounded-lg border p-4">
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium">
          {t(CLE_TRADUCTION_TYPE[document.type])}
        </span>
        <StatusBadge kind="document" value={document.status} />
      </div>
      {avecExpiration && document.expiresAt && (
        <p className="text-xs text-muted-foreground">
          {t("review.columnExpiresAt")} : {formatDate(document.expiresAt)}
        </p>
      )}
      {document.rejectionReason && (
        <p className="text-xs text-state-danger">{document.rejectionReason}</p>
      )}
      {children}
    </div>
  );
}
