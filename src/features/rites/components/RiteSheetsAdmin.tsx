"use client";

import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import type { RiteSheet } from "../api/schemas";
import { useFichesAdmin, useValiderFiche } from "../api/use-rites-admin";
import { RiteSheetFormDialog } from "./RiteSheetFormDialog";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Gestion des fiches de rites (administrateur) : toutes les fiches,
 * publiées ou non, avec création, modification et validation explicite.
 * Valider engage la personne qualifiée qui a relu le texte — d'où la
 * confirmation (CLAUDE.md, contenu religieux).
 */
export function RiteSheetsAdmin() {
  const t = useTranslations("rites.admin");
  const query = useFichesAdmin();

  return (
    <section className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="space-y-1">
          <h2 className="text-lg font-medium">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        <RiteSheetFormDialog
          trigger={
            <Button size="sm">
              <Plus aria-hidden className="size-4" />
              {t("create")}
            </Button>
          }
        />
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-40 w-full" />}
        empty={<p className="text-muted-foreground text-sm">{t("empty")}</p>}
      >
        {(fiches) => (
          <ul className="bg-card divide-y rounded-xl border">
            {fiches.map((fiche) => (
              <LigneFiche key={fiche.id} fiche={fiche} />
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </section>
  );
}

function LigneFiche({ fiche }: Readonly<{ fiche: RiteSheet }>) {
  const t = useTranslations("rites.admin");
  const valider = useValiderFiche();

  return (
    <li className="flex flex-wrap items-start justify-between gap-3 px-4 py-3">
      <div className="min-w-0 space-y-1">
        <p className="flex flex-wrap items-center gap-2 font-medium">
          {fiche.title}
          <StatusBadge
            kind="riteSheet"
            value={fiche.isValidated ? "validated" : "pending"}
          />
        </p>
        <p className="text-muted-foreground text-xs">
          {t("meta", {
            key: fiche.key,
            type: t(`form.types.${fiche.pilgrimageType}`),
            language: fiche.language.toUpperCase(),
            order: fiche.order,
            version: fiche.version,
          })}
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <RiteSheetFormDialog
          fiche={fiche}
          trigger={
            <Button size="sm" variant="outline">
              {t("edit")}
            </Button>
          }
        />
        {!fiche.isValidated && (
          <ConfirmDialog
            trigger={<Button size="sm">{t("validate")}</Button>}
            title={t("validateTitle", { title: fiche.title })}
            description={t("validateBody")}
            confirmLabel={t("validate")}
            enCours={valider.isPending}
            onConfirm={() =>
              valider.mutateAsync(fiche.id).then(
                () => toast.success(t("validated")),
                (erreur: unknown) => {
                  toast.error(t("error"));
                  throw erreur;
                },
              )
            }
          />
        )}
      </div>
    </li>
  );
}
