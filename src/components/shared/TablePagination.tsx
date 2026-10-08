"use client";

import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "cn";
import { Button } from "@/components/ui/button";
import { formatNombre } from "@/lib/format";
import { pagesVisibles } from "./pages-visibles";

/**
 * Pied de tableau : plage affichée (« 1–20 sur 57 ») et pages numérotées
 * avec précédent/suivant. Sous `sm`, seul « Page x sur y » remplace la
 * rangée de numéros, trop large pour un écran de 360 px.
 */
export interface TablePaginationProps {
  pageIndex: number;
  pageCount: number;
  pageSize: number;
  totalRows: number;
  onPageChange: (pageIndex: number) => void;
}

export function TablePagination({
  pageIndex,
  pageCount,
  pageSize,
  totalRows,
  onPageChange,
}: TablePaginationProps) {
  const t = useTranslations("common");
  const premiere = pageIndex * pageSize + 1;
  const derniere = Math.min(totalRows, (pageIndex + 1) * pageSize);

  return (
    <nav
      aria-label={t("tablePagination")}
      className="flex flex-wrap items-center justify-between gap-3 border-t px-4 py-3 text-sm"
    >
      <span className="text-muted-foreground tabular-nums">
        {t("tableRange", {
          from: formatNombre(premiere),
          to: formatNombre(derniere),
          total: formatNombre(totalRows),
        })}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex - 1)}
          disabled={pageIndex === 0}
          aria-label={t("tablePrevious")}
        >
          <ChevronLeft aria-hidden />
        </Button>
        <span className="text-muted-foreground px-2 sm:hidden">
          {t("tablePage", { page: pageIndex + 1, total: pageCount })}
        </span>
        <ul className="hidden items-center gap-1 sm:flex">
          {pagesVisibles(pageIndex, pageCount).map((element, position) =>
            element === "…" ? (
              <li
                key={`ellipse-${position}`}
                aria-hidden
                className="text-muted-foreground w-8 text-center"
              >
                …
              </li>
            ) : (
              <li key={element}>
                <button
                  type="button"
                  onClick={() => onPageChange(element)}
                  aria-current={element === pageIndex ? "page" : undefined}
                  aria-label={t("tableGoToPage", { page: element + 1 })}
                  className={cn(
                    "inline-flex size-8 items-center justify-center rounded-md text-sm tabular-nums transition-colors duration-(--motion-fast)",
                    element === pageIndex
                      ? "bg-primary text-primary-foreground font-semibold"
                      : "hover:bg-muted",
                  )}
                >
                  {element + 1}
                </button>
              </li>
            ),
          )}
        </ul>
        <Button
          variant="outline"
          size="icon-sm"
          onClick={() => onPageChange(pageIndex + 1)}
          disabled={pageIndex >= pageCount - 1}
          aria-label={t("tableNext")}
        >
          <ChevronRight aria-hidden />
        </Button>
      </div>
    </nav>
  );
}
