"use client";

import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useBasculerElement, useChecklist } from "../api/use-checklist";
import type { ChecklistItem } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

/**
 * Checklist de départ du pèlerin (ticket #56) : éléments regroupés par
 * catégorie, cochables, avec la date de rappel envoyée par le backend.
 */

const CATEGORIES = ["document", "vaccine", "luggage", "spiritual"] as const;
type Categorie = (typeof CATEGORIES)[number] | "other";

function categorieConnue(valeur: string): Categorie {
  return (CATEGORIES as readonly string[]).includes(valeur)
    ? (valeur as Categorie)
    : "other";
}

function regrouper(elements: readonly ChecklistItem[]) {
  const groupes = new Map<Categorie, ChecklistItem[]>();
  for (const element of elements) {
    const categorie = categorieConnue(element.category);
    groupes.set(categorie, [...(groupes.get(categorie) ?? []), element]);
  }
  return [...groupes.entries()];
}

function Element({
  element,
  bookingId,
}: Readonly<{ element: ChecklistItem; bookingId: string }>) {
  const t = useTranslations("checklist");
  const bascule = useBasculerElement(bookingId);

  async function basculer() {
    try {
      await bascule.mutateAsync({
        id: element.id,
        isCompleted: !element.isCompleted,
      });
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <li>
      <label className="hover:bg-muted flex cursor-pointer items-start gap-3 rounded-md px-2 py-2.5">
        <input
          type="checkbox"
          checked={element.isCompleted}
          disabled={bascule.isPending}
          onChange={basculer}
          className="accent-primary mt-0.5 size-4 shrink-0"
        />
        <span className="space-y-0.5">
          <span
            className={
              element.isCompleted
                ? "text-muted-foreground block text-sm line-through"
                : "block text-sm"
            }
          >
            {element.title}
          </span>
          {element.reminderDate ? (
            <span className="text-muted-foreground block text-xs">
              {t("reminder", { date: formatDate(element.reminderDate) })}
            </span>
          ) : null}
        </span>
      </label>
    </li>
  );
}

export function ChecklistPanel({ bookingId }: Readonly<{ bookingId: string }>) {
  const t = useTranslations("checklist");
  const query = useChecklist(bookingId);

  return (
    <section aria-labelledby="checklist-titre" className="space-y-4">
      <div className="space-y-1">
        <h2 id="checklist-titre" className="text-lg font-medium">
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-40 w-full" />}
        empty={
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        }
      >
        {(elements) => {
          const faits = elements.filter((e) => e.isCompleted).length;
          return (
            <div className="bg-card space-y-5 rounded-xl border p-5">
              <div className="space-y-2">
                <p className="text-sm font-medium">
                  {t("progress", { done: faits, total: elements.length })}
                </p>
                <progress
                  value={faits}
                  max={elements.length}
                  aria-label={t("title")}
                  className="accent-primary h-2 w-full"
                />
                {faits === elements.length ? (
                  <p className="text-state-success text-sm font-medium">
                    {t("allDone")}
                  </p>
                ) : null}
              </div>
              {regrouper(elements).map(([categorie, liste]) => (
                <div key={categorie} className="space-y-1">
                  <h3 className="text-muted-foreground text-xs font-semibold tracking-wide uppercase">
                    {t(`category.${categorie}`)}
                  </h3>
                  <ul>
                    {liste.map((element) => (
                      <Element
                        key={element.id}
                        element={element}
                        bookingId={bookingId}
                      />
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
