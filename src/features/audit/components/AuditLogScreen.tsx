"use client";

import { useCallback, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { Download } from "lucide-react";
import {
  AUDIT_ACTIONS,
  cleAction,
  lienCsvAudit,
  useJournalAudit,
  type AuditLog,
  type FiltresAudit,
} from "../api/use-audit";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDateHeure } from "@/lib/format";

const DATE_JOUR = /^\d{4}-\d{2}-\d{2}$/;

function details(entree: AuditLog): string {
  return Object.entries(entree.metadata ?? {})
    .filter(([, v]) => v !== null && v !== "")
    .map(([k, v]) => `${k} : ${String(v)}`)
    .join(" · ");
}

/**
 * Piste d'audit (idée #85) : qui a fait quelle action sensible, quand, sur
 * quoi. Filtres dans l'URL (règle 8) ; l'export CSV reprend les mêmes
 * filtres et est lui-même tracé par le backend.
 */
export function AuditLogScreen() {
  const t = useTranslations("audit");
  const tr = useTranslations("nav.roles");
  const params = useSearchParams();
  const router = useRouter();
  const lireDate = (v: string | null) =>
    v && DATE_JOUR.test(v) ? v : undefined;
  const actionLue = params.get("action");
  const filtres: FiltresAudit = {
    from: lireDate(params.get("from")),
    to: lireDate(params.get("to")),
    action: AUDIT_ACTIONS.find((a) => a === actionLue),
    entityId: params.get("entityId")?.trim() || undefined,
  };
  const query = useJournalAudit(filtres);
  // Action inconnue de cet écran (ajoutée côté backend depuis) : son
  // identifiant brut plutôt qu'une clé manquante.
  const libelleAction = useCallback(
    (action: string) =>
      t.has(`actions.${cleAction(action)}`)
        ? t(`actions.${cleAction(action)}`)
        : action,
    [t],
  );

  function definir(cle: keyof FiltresAudit, valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set(cle, valeur);
    else suivant.delete(cle);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  const columns: ColumnDef<AuditLog>[] = useMemo(
    () => [
      {
        accessorKey: "createdAt",
        header: t("columnDate"),
        cell: ({ row }) => (
          <span className="whitespace-nowrap">
            {formatDateHeure(row.original.createdAt)}
          </span>
        ),
      },
      {
        accessorKey: "action",
        header: t("columnAction"),
        cell: ({ row }) => libelleAction(row.original.action),
      },
      {
        id: "actor",
        header: t("columnActor"),
        cell: ({ row }) =>
          row.original.actorName
            ? `${row.original.actorName} · ${row.original.actorRole ? tr(row.original.actorRole) : ""}`
            : t("system"),
      },
      {
        id: "entity",
        header: t("columnEntity"),
        cell: ({ row }) => (
          <span className="block max-w-56 font-mono text-xs break-all whitespace-normal">
            {row.original.entityType} {row.original.entityId ?? ""}
          </span>
        ),
      },
      {
        id: "details",
        header: t("columnDetails"),
        cell: ({ row }) => (
          <span className="text-muted-foreground block max-w-64 text-xs break-all whitespace-normal">
            {details(row.original)}
          </span>
        ),
      },
    ],
    [t, tr, libelleAction],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end gap-3">
        {(["from", "to"] as const).map((cle) => (
          <div key={cle} className="space-y-1">
            <Label htmlFor={`audit-${cle}`}>{t(cle)}</Label>
            <Input
              id={`audit-${cle}`}
              type="date"
              className="w-44"
              value={filtres[cle] ?? ""}
              onChange={(e) => definir(cle, e.target.value)}
            />
          </div>
        ))}
        <div className="space-y-1">
          <Label htmlFor="audit-action">{t("action")}</Label>
          <select
            id="audit-action"
            value={filtres.action ?? ""}
            onChange={(e) => definir("action", e.target.value)}
            className="border-input bg-background h-(--size-field) w-64 rounded-md border px-3 text-sm"
          >
            <option value="">{t("allActions")}</option>
            {AUDIT_ACTIONS.map((a) => (
              <option key={a} value={a}>
                {libelleAction(a)}
              </option>
            ))}
          </select>
        </div>
        <div className="space-y-1">
          <Label htmlFor="audit-entite">{t("entityId")}</Label>
          <Input
            id="audit-entite"
            className="w-72 font-mono"
            defaultValue={filtres.entityId ?? ""}
            onBlur={(e) => definir("entityId", e.target.value.trim())}
          />
        </div>
        <Button asChild variant="outline" className="ml-auto">
          <a href={lienCsvAudit(filtres)} download>
            <Download aria-hidden className="size-4" />
            {t("download")}
          </a>
        </Button>
      </div>
      <p className="text-muted-foreground text-xs">{t("hint")}</p>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={8} />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(entrees) => (
          <DataTable
            data={entrees}
            columns={columns}
            getRowId={(e) => e.id}
            renderCard={(e) => (
              <div className="space-y-1 rounded-lg border p-4 text-sm">
                <p className="font-medium">{libelleAction(e.action)}</p>
                <p className="text-muted-foreground text-xs">
                  {formatDateHeure(e.createdAt)} · {e.actorName ?? t("system")}
                </p>
                <p className="font-mono text-xs break-all">
                  {e.entityType} {e.entityId ?? ""}
                </p>
                {details(e) && (
                  <p className="text-muted-foreground text-xs break-all">
                    {details(e)}
                  </p>
                )}
              </div>
            )}
          />
        )}
      </AsyncBoundary>
    </div>
  );
}
