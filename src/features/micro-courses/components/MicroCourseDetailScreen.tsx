"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, CheckCircle2, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import {
  estTermine,
  useMarquerCours,
  useMicroCourse,
  useMyMicroCourseProgress,
} from "../api/use-micro-courses";
import type { MicroCourse } from "../api/schemas";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Can } from "@/components/shared/Can";
import { EmptyState } from "@/components/shared/EmptyState";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types";
import { formatDuree } from "@/lib/format";

/**
 * Lecture d'un micro-cours (ticket #82). La vidéo est lue par la balise
 * `<video>` native, avec un lien de secours si le format n'est pas lu par
 * le navigateur. Un cours de la catégorie « rites » porte l'indicateur
 * « à valider par une personne qualifiée » : le backend n'expose aucune
 * validation pour ces cours (`CLAUDE.md` règle 13).
 */
function Lecteur({ cours }: Readonly<{ cours: MicroCourse }>) {
  const t = useTranslations("microCourses");
  return (
    <div className="space-y-2">
      <video
        controls
        preload="metadata"
        src={cours.videoUrl}
        className="aspect-video w-full rounded-xl bg-black"
      />
      <a
        href={cours.videoUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-xs"
      >
        <ExternalLink aria-hidden className="size-3.5" />
        {t("openVideo")}
      </a>
    </div>
  );
}

function Progression({ courseId }: Readonly<{ courseId: string }>) {
  const t = useTranslations("microCourses");
  const { data: progression } = useMyMicroCourseProgress();
  const marquer = useMarquerCours();
  const termine = estTermine(progression, courseId);

  return (
    <div className="flex flex-wrap items-center gap-3">
      {termine && (
        <span className="text-state-success inline-flex items-center gap-1 text-sm font-medium">
          <CheckCircle2 aria-hidden className="size-4" />
          {t("done")}
        </span>
      )}
      <Button
        variant={termine ? "outline" : "default"}
        disabled={marquer.isPending}
        onClick={() => {
          marquer
            .mutateAsync({ courseId, isCompleted: !termine })
            .catch(() => toast.error(t("progressError")));
        }}
      >
        {termine ? t("markNotDone") : t("markDone")}
      </Button>
    </div>
  );
}

export function MicroCourseDetailScreen({ id }: Readonly<{ id: string }>) {
  const t = useTranslations("microCourses");
  const query = useMicroCourse(id);
  const introuvable =
    query.error instanceof ApiError && query.error.statusCode === 404;

  return (
    <div className="space-y-6">
      <Link
        href="/micro-courses"
        className="text-muted-foreground hover:text-foreground inline-flex items-center gap-2 text-sm"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("back")}
      </Link>
      {introuvable ? (
        <EmptyState title={t("notFound")} />
      ) : (
        <AsyncBoundary
          query={query}
          isEmpty={() => false}
          skeleton={<Skeleton className="aspect-video w-full" />}
        >
          {(cours) => (
            <article className="max-w-3xl space-y-5">
              <div className="space-y-1">
                <h2 className="text-2xl font-semibold tracking-tight">
                  {cours.title}
                </h2>
                <p className="text-muted-foreground text-sm">
                  {formatDuree(cours.durationSeconds)}
                </p>
              </div>
              {cours.category === "rites" && (
                <ReligiousContentNotice validated={false} />
              )}
              <Lecteur cours={cours} />
              {cours.description && (
                <p className="text-sm leading-relaxed">{cours.description}</p>
              )}
              <Can role="pilgrim">
                <Progression courseId={cours.id} />
              </Can>
            </article>
          )}
        </AsyncBoundary>
      )}
    </div>
  );
}
