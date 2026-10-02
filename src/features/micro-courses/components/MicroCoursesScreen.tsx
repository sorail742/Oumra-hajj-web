"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { CheckCircle2, PlayCircle } from "lucide-react";
import {
  estTermine,
  useMicroCourses,
  useMyMicroCourseProgress,
} from "../api/use-micro-courses";
import { CATEGORIES_MICRO_COURS } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDuree } from "@/lib/format";

/**
 * Catalogue des micro-cours (ticket #82) : consultable sans compte,
 * catégorie dans l'URL (règle 8), cours terminés cochés pour le pèlerin.
 */
type Filtre = (typeof CATEGORIES_MICRO_COURS)[number] | "all";

export function MicroCoursesScreen() {
  const t = useTranslations("microCourses");
  const params = useSearchParams();
  const router = useRouter();
  const brut = params.get("category");
  const filtre: Filtre =
    CATEGORIES_MICRO_COURS.find((c) => c === brut) ?? "all";
  const query = useMicroCourses(filtre === "all" ? undefined : filtre);
  const { data: progression } = useMyMicroCourseProgress();

  return (
    <div className="space-y-4">
      <SegmentedControl
        label={t("categoryFilter")}
        value={filtre}
        onChange={(valeur) =>
          router.replace(valeur === "all" ? "?" : `?category=${valeur}`, {
            scroll: false,
          })
        }
        options={(["all", ...CATEGORIES_MICRO_COURS] as const).map((c) => ({
          value: c,
          label: t(`category.${c}`),
        }))}
      />
      <AsyncBoundary
        query={query}
        skeleton={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        }
        empty={<EmptyState title={t("empty")} />}
      >
        {(cours) => (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cours.map((c) => {
              const termine = estTermine(progression, c.id);
              return (
                <li key={c.id}>
                  <Link
                    href={`/micro-courses/${c.id}`}
                    className="bg-card hover:border-primary/40 flex h-full flex-col gap-3 rounded-xl border p-5 transition-colors"
                  >
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-muted-foreground text-xs font-medium uppercase">
                        {t.has(`category.${c.category}`)
                          ? t(`category.${c.category}`)
                          : c.category}
                      </span>
                      {termine ? (
                        <span className="text-state-success inline-flex items-center gap-1 text-xs font-medium">
                          <CheckCircle2 aria-hidden className="size-4" />
                          {t("done")}
                        </span>
                      ) : null}
                    </div>
                    <p className="font-medium">{c.title}</p>
                    <span className="text-muted-foreground mt-auto inline-flex items-center gap-2 text-sm">
                      <PlayCircle aria-hidden className="size-4" />
                      {formatDuree(c.durationSeconds)}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}
