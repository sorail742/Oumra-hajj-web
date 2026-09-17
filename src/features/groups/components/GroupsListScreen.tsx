"use client";

import { useMemo } from "react";
import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { useGroups } from "../api/use-groups";
import type { Group } from "../api/schemas";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

export function GroupsListScreen() {
  const t = useTranslations("groups");
  const role = useRole();

  const query = useGroups();

  const columns: ColumnDef<Group>[] = useMemo(
    () => [
      {
        accessorKey: "title",
        header: t("columnTitle"),
        cell: ({ row }) => (
          <Link href={`/groups/${row.original.id}`} className="hover:underline">
            {row.original.title}
          </Link>
        ),
      },
      {
        accessorKey: "memberIds",
        header: t("columnMembers"),
        cell: ({ row }) => row.original.memberIds.length,
      },
      {
        accessorKey: "guideId",
        header: t("columnGuide"),
        cell: ({ row }) =>
          row.original.guideId ? t("guideAssigned") : t("guideUnassigned"),
      },
    ],
    [t],
  );

  if (role !== "agency" && role !== "guide" && role !== "pilgrim") {
    return <EmptyState title={t("roleUnsupportedTitle")} />;
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<TableSkeleton rows={5} />}
      empty={<EmptyState title={t("emptyTitle")} />}
    >
      {(groups) => (
        <DataTable
          data={groups}
          columns={columns}
          getRowId={(g) => g.id}
          renderCard={(g) => (
            <Link
              href={`/groups/${g.id}`}
              className="block rounded-lg border p-4"
            >
              <div className="flex items-start justify-between gap-2">
                <span className="text-sm font-medium">{g.title}</span>
                <span className="text-muted-foreground text-xs">
                  {g.guideId ? t("guideAssigned") : t("guideUnassigned")}
                </span>
              </div>
              <div className="text-muted-foreground mt-1 text-xs">
                {t("membersCount", { count: g.memberIds.length })}
              </div>
            </Link>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
