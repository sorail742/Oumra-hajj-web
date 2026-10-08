"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { cn } from "cn";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { FormSection } from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { formatDate } from "@/lib/format";
import {
  NIVEAUX_MOBILITE,
  useEnregistrerBesoins,
  useSpecialNeeds,
  type SaisieBesoins,
  type SpecialNeeds,
} from "../api/use-special-needs";

/**
 * Besoins spéciaux déclarés par le pèlerin (idée #69) : mobilité, régime,
 * information médicale, accompagnement. Le texte dit d'emblée qui les
 * voit — l'agence et le guide, jamais l'administration — et qu'un champ
 * vidé est effacé. Rien n'est journalisé ni gardé hors session.
 */
const CHAMPS_TEXTE = ["dietary", "medical", "assistance"] as const;
const LONGUEUR_MAX = 500;

function Formulaire({ initial }: Readonly<{ initial: SpecialNeeds }>) {
  const t = useTranslations("specialNeeds");
  const id = useId();
  const enregistrement = useEnregistrerBesoins();
  const [saisie, setSaisie] = useState<SaisieBesoins>({
    mobility: initial.mobility,
    dietary: initial.dietary ?? "",
    medical: initial.medical ?? "",
    assistance: initial.assistance ?? "",
  });

  return (
    <form
      className="space-y-5"
      onSubmit={(evenement) => {
        evenement.preventDefault();
        enregistrement
          .mutateAsync(saisie)
          .then(() => toast.success(t("saved")))
          .catch(() => toast.error(t("error")));
      }}
    >
      <fieldset className="space-y-2">
        <legend className="text-sm font-medium">{t("mobility")}</legend>
        <div className="grid gap-2 sm:grid-cols-3">
          {NIVEAUX_MOBILITE.map((niveau) => (
            <label
              key={niveau}
              className={cn(
                "flex min-h-(--size-touch) cursor-pointer items-center gap-2 rounded-md border px-3 text-sm transition-colors duration-(--motion-fast)",
                saisie.mobility === niveau
                  ? "border-primary bg-primary-subtle font-medium"
                  : "hover:bg-muted",
              )}
            >
              <input
                type="radio"
                name={`${id}-mobilite`}
                value={niveau}
                checked={saisie.mobility === niveau}
                onChange={() => setSaisie((s) => ({ ...s, mobility: niveau }))}
                className="accent-(--primary)"
              />
              {t(`mobilityLevels.${niveau}`)}
            </label>
          ))}
        </div>
      </fieldset>
      {CHAMPS_TEXTE.map((champ) => (
        <div key={champ} className="space-y-2">
          <Label htmlFor={`${id}-${champ}`}>{t(champ)}</Label>
          <Textarea
            id={`${id}-${champ}`}
            value={saisie[champ] ?? ""}
            maxLength={LONGUEUR_MAX}
            rows={2}
            placeholder={t(`${champ}Placeholder`)}
            onChange={(e) =>
              setSaisie((s) => ({ ...s, [champ]: e.target.value }))
            }
          />
        </div>
      ))}
      <div className="flex flex-wrap items-center gap-4">
        <Button
          type="submit"
          disabled={enregistrement.isPending}
          className="h-(--size-touch) px-6"
        >
          {enregistrement.isPending && (
            <Loader2 aria-hidden className="size-4 animate-spin" />
          )}
          {t("save")}
        </Button>
        {initial.updatedAt && (
          <span className="text-muted-foreground text-xs">
            {t("updatedOn", { date: formatDate(initial.updatedAt) })}
          </span>
        )}
      </div>
    </form>
  );
}

export function SpecialNeedsForm() {
  const t = useTranslations("specialNeeds");
  const query = useSpecialNeeds();

  return (
    <div className="max-w-(--content-form)">
      <FormSection titre={t("title")} aide={t("description")}>
        <p className="bg-muted text-muted-foreground flex gap-2 rounded-md px-3 py-2 text-sm">
          <Lock aria-hidden className="mt-0.5 size-4 shrink-0" />
          {t("privacy")}
        </p>
        <AsyncBoundary
          query={query}
          skeleton={<Skeleton className="h-64 w-full" />}
          isEmpty={() => false}
        >
          {(besoins) => (
            <Formulaire key={besoins.updatedAt ?? "vide"} initial={besoins} />
          )}
        </AsyncBoundary>
      </FormSection>
    </div>
  );
}
