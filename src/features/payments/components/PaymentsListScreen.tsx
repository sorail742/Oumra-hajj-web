"use client";

import { useMemo } from "react";
import type { ColumnDef } from "@tanstack/react-table";
import { useTranslations } from "next-intl";
import { usePayments } from "../api/use-payments";
import type { Payment } from "../api/schemas";
import { RefundRequestFlow } from "./RefundRequestFlow";
import { useRole } from "@/lib/auth/role-context";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { DataTable } from "@/components/shared/DataTable";
import { EmptyState } from "@/components/shared/EmptyState";
import { Money } from "@/components/shared/Money";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { TableSkeleton } from "@/components/shared/TableSkeleton";

const CLE_TRADUCTION_METHODE: Record<Payment["method"], string> = {
  mobile_money_orange: "methodMobileMoneyOrange",
  mobile_money_mtn: "methodMobileMoneyMtn",
  card: "methodCard",
};

export function PaymentsListScreen() {
  const t = useTranslations("payments");
  const role = useRole();
  const query = usePayments();

  const columns: ColumnDef<Payment>[] = useMemo(
    () => [
      {
        accessorKey: "bookingId",
        header: t("columnBooking"),
        cell: ({ row }) => (
          <span className="font-mono text-xs">{row.original.bookingId}</span>
        ),
      },
      {
        accessorKey: "amount",
        header: t("columnAmount"),
        cell: ({ row }) => <Money montant={row.original.amount} />,
      },
      {
        accessorKey: "method",
        header: t("columnMethod"),
        cell: ({ row }) => t(CLE_TRADUCTION_METHODE[row.original.method]),
      },
      {
        accessorKey: "status",
        header: t("columnStatus"),
        cell: ({ row }) => (
          <StatusBadge kind="payment" value={row.original.status} />
        ),
      },
      {
        id: "actions",
        header: "",
        cell: ({ row }) =>
          row.original.status === "succeeded" ? (
            <RefundRequestFlow payment={row.original} />
          ) : null,
      },
    ],
    [t],
  );

  if (role !== "pilgrim" && role !== "agency") {
    return <EmptyState title={t("roleUnsupportedTitle")} />;
  }

  return (
    <AsyncBoundary
      query={query}
      skeleton={<TableSkeleton rows={6} />}
      empty={
        <EmptyState
          title={t("emptyTitle")}
          description={t("emptyDescription")}
        />
      }
    >
      {(payments) => (
        <DataTable
          data={payments}
          columns={columns}
          getRowId={(p) => p.id}
          renderCard={(p) => (
            <div className="space-y-2 rounded-lg border p-4">
              <div className="flex items-start justify-between gap-2">
                <span className="font-mono text-xs">{p.bookingId}</span>
                <StatusBadge kind="payment" value={p.status} />
              </div>
              <div className="flex items-center justify-between">
                <Money montant={p.amount} />
                <span className="text-muted-foreground text-xs">
                  {t(CLE_TRADUCTION_METHODE[p.method])}
                </span>
              </div>
              {p.status === "succeeded" ? (
                <RefundRequestFlow payment={p} />
              ) : null}
            </div>
          )}
        />
      )}
    </AsyncBoundary>
  );
}
