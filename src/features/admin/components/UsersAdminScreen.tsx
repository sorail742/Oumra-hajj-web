"use client";

import { useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import {
  ROLES_UTILISATEUR,
  useUsers,
  type AdminUser,
  type RoleUtilisateur,
} from "../api/use-users";
import { AccountStatusDialog } from "./AccountStatusDialog";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { Input } from "@/components/ui/input";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { formatDate, formatTelephone } from "@/lib/format";

/**
 * Utilisateurs de la plateforme pour l'administrateur (ticket #74) : rôle
 * et recherche dans l'URL (règle 8), statut du compte, suspension et
 * réactivation confirmées. L'administrateur ne peut pas se suspendre
 * lui-même depuis cet écran.
 */
function lireRole(brut: string | null): RoleUtilisateur {
  return ROLES_UTILISATEUR.find((r) => r === brut) ?? "pilgrim";
}

function contact(u: AdminUser): string {
  if (u.email) return u.email;
  return u.phone ? formatTelephone(u.phone) : "—";
}

export function UsersAdminScreen() {
  const t = useTranslations("adminUsers");
  const tNav = useTranslations("nav");
  const params = useSearchParams();
  const router = useRouter();
  const role = lireRole(params.get("role"));
  const recherche = params.get("q") ?? "";
  const query = useUsers(role);
  const { data: moi } = useCurrentUser();

  function definir(cle: "role" | "q", valeur: string) {
    const suivant = new URLSearchParams(params.toString());
    if (valeur) suivant.set(cle, valeur);
    else suivant.delete(cle);
    router.replace(`?${suivant.toString()}`, { scroll: false });
  }

  const columns: ColumnDef<AdminUser>[] = useMemo(
    () => [
      { accessorKey: "fullName", header: t("columnName") },
      {
        id: "contact",
        header: t("columnContact"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{contact(row.original)}</span>
        ),
      },
      {
        accessorKey: "createdAt",
        header: t("columnSince"),
        cell: ({ row }) => formatDate(row.original.createdAt),
      },
      {
        accessorKey: "isActive",
        header: t("columnStatus"),
        cell: ({ row }) => (
          <StatusBadge
            kind="userAccount"
            value={row.original.isActive ? "active" : "suspended"}
          />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.id === moi?.id ? null : (
            <AccountStatusDialog utilisateur={row.original} />
          ),
      },
    ],
    [t, moi?.id],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <SegmentedControl
          label={t("roleFilter")}
          value={role}
          onChange={(valeur) => definir("role", valeur)}
          options={ROLES_UTILISATEUR.map((r) => ({
            value: r,
            label: tNav(`rolesPlural.${r}`),
          }))}
        />
        <Input
          type="search"
          aria-label={t("search")}
          placeholder={t("searchPlaceholder")}
          defaultValue={recherche}
          onChange={(e) => definir("q", e.target.value.trim())}
          className="w-full sm:w-64"
        />
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<TableSkeleton rows={6} />}
        empty={<EmptyState title={t("empty")} />}
      >
        {(utilisateurs) => {
          const terme = recherche.toLowerCase();
          const visibles = terme
            ? utilisateurs.filter((u) =>
                [u.fullName, u.email ?? "", u.phone ?? ""].some((champ) =>
                  champ.toLowerCase().includes(terme),
                ),
              )
            : utilisateurs;
          if (visibles.length === 0) {
            return <EmptyState title={t("noMatch")} />;
          }
          return (
            <DataTable
              data={visibles}
              columns={columns}
              getRowId={(u) => u.id}
              renderCard={(u) => (
                <div className="space-y-2 rounded-lg border p-4">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-medium">{u.fullName}</span>
                    <StatusBadge
                      kind="userAccount"
                      value={u.isActive ? "active" : "suspended"}
                    />
                  </div>
                  <p className="text-muted-foreground font-mono text-xs">
                    {contact(u)}
                  </p>
                  {u.id === moi?.id ? null : (
                    <AccountStatusDialog utilisateur={u} />
                  )}
                </div>
              )}
            />
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
