"use client";

import { useState, type ReactNode } from "react";
import {
  flexRender,
  getCoreRowModel,
  getPaginationRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { EmptyState } from "./EmptyState";
import { TablePagination } from "./TablePagination";

/**
 * Tableau générique — pagination **toujours côté client** (aucun endpoint
 * ne pagine côté serveur à ce jour, voir `docs/contrat-api.md`). Cartes
 * sous `md` via `renderCard`, contenu spécifique au domaine consommateur —
 * voir `docs/design-system.md` §5.
 */
export interface DataTableProps<T> {
  data: T[];
  columns: ColumnDef<T>[];
  getRowId: (row: T) => string;
  renderCard: (row: T) => ReactNode;
  pageSize?: number;
  empty?: ReactNode;
}

export function DataTable<T>({
  data,
  columns,
  getRowId,
  renderCard,
  pageSize = 20,
  empty,
}: DataTableProps<T>) {
  const [pagination, setPagination] = useState({ pageIndex: 0, pageSize });

  const table = useReactTable({
    data,
    columns,
    state: { pagination },
    onPaginationChange: setPagination,
    getRowId: (row) => getRowId(row),
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  if (data.length === 0) {
    return <>{empty ?? <EmptyState />}</>;
  }

  const piedDePage =
    table.getPageCount() > 1 ? (
      <TablePagination
        pageIndex={table.getState().pagination.pageIndex}
        pageCount={table.getPageCount()}
        pageSize={table.getState().pagination.pageSize}
        totalRows={data.length}
        onPageChange={(page) => table.setPageIndex(page)}
      />
    ) : null;

  return (
    <div className="space-y-4">
      {/* Cartes — sous md */}
      <div className="space-y-3 md:hidden">
        {table.getRowModel().rows.map((row) => (
          <div key={row.id}>{renderCard(row.original)}</div>
        ))}
      </div>

      {/* Tableau réel — md et plus */}
      <div className="bg-card hidden overflow-hidden rounded-lg border shadow-(--shadow-card) md:block">
        <Table className="text-sm">
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext(),
                        )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.map((row) => (
              <TableRow key={row.id}>
                {row.getVisibleCells().map((cell) => (
                  <TableCell key={cell.id}>
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        {piedDePage}
      </div>

      {/* Sous md, la pagination suit les cartes. */}
      {piedDePage ? (
        <div className="bg-card rounded-lg border md:hidden [&>nav]:border-t-0">
          {piedDePage}
        </div>
      ) : null}
    </div>
  );
}
