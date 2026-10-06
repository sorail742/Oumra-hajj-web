"use client";

import { useTranslations } from "next-intl";
import { Trash2 } from "lucide-react";
import { toast } from "sonner";
import {
  totalBudget,
  useMesBudgets,
  useSupprimerBudget,
} from "../api/use-budget";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Money } from "@/components/shared/Money";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";

/** Simulations enregistrées, la plus récente en premier (backend #2). */
export function SavedBudgets({
  titres,
}: Readonly<{ titres: ReadonlyMap<string, string> }>) {
  const t = useTranslations("budget.saved");
  const query = useMesBudgets();
  const supprimer = useSupprimerBudget();

  return (
    <section className="space-y-3">
      <h2 className="text-lg font-medium">{t("title")}</h2>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-24 w-full" />}
        empty={<p className="text-muted-foreground text-sm">{t("empty")}</p>}
      >
        {(budgets) => (
          <ul className="bg-card divide-y rounded-xl border">
            {[...budgets]
              .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
              .map((b) => (
                <li
                  key={b.id}
                  className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm"
                >
                  <span className="space-y-0.5">
                    <span className="block font-medium">
                      {b.packageId
                        ? (titres.get(b.packageId) ?? t("unknownPackage"))
                        : t("noPackage")}
                    </span>
                    <span className="text-muted-foreground block text-xs">
                      {formatDate(b.createdAt)}
                    </span>
                  </span>
                  <span className="flex items-center gap-2">
                    <span className="font-semibold">
                      <Money montant={totalBudget(b)} />
                    </span>
                    <ConfirmDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="icon"
                          aria-label={t("delete")}
                        >
                          <Trash2 aria-hidden className="size-4" />
                        </Button>
                      }
                      title={t("deleteTitle")}
                      description={t("deleteBody")}
                      confirmLabel={t("delete")}
                      destructive
                      enCours={supprimer.isPending}
                      onConfirm={() =>
                        supprimer.mutateAsync(b.id).then(
                          () => toast.success(t("deleted")),
                          (e: unknown) => {
                            toast.error(t("error"));
                            throw e;
                          },
                        )
                      }
                    />
                  </span>
                </li>
              ))}
          </ul>
        )}
      </AsyncBoundary>
    </section>
  );
}
