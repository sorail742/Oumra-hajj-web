"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useEnregistrerBareme, useMonBareme } from "../api/use-refund-policy";
import { lireBareme, versLignes, type LigneBareme } from "../lib/bareme";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { FormSection } from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { resoudreErreurFormulaire } from "@/lib/api/form-errors";

const MAX_PALIERS = 10;

/**
 * Barème de remboursement de l'agence (idée #58) : paliers « à partir de
 * N jours avant le départ, X % remboursé ». Il est figé sur chaque
 * réservation à sa création : le modifier ne change rien pour les
 * pèlerins déjà inscrits — l'écran le rappelle.
 */
export function RefundPolicyEditor() {
  const query = useMonBareme();
  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-48 w-full" />}
      isEmpty={() => false}
    >
      {(bareme) => <Editeur initial={versLignes(bareme.tiers)} />}
    </AsyncBoundary>
  );
}

function Editeur({ initial }: Readonly<{ initial: LigneBareme[] }>) {
  const t = useTranslations("myAgency.refundPolicy");
  const enregistrement = useEnregistrerBareme();
  const [lignes, setLignes] = useState<LigneBareme[]>(initial);
  const lu = lireBareme(lignes);

  function modifier(index: number, champ: keyof LigneBareme, valeur: string) {
    setLignes((l) =>
      l.map((ligne, i) =>
        i === index ? { ...ligne, [champ]: valeur } : ligne,
      ),
    );
  }

  async function enregistrer(e: FormEvent) {
    e.preventDefault();
    if ("erreur" in lu) return;
    try {
      const bareme = await enregistrement.mutateAsync(lu.paliers);
      setLignes(versLignes(bareme.tiers));
      toast.success(t("saved"));
    } catch (erreur) {
      toast.error(
        resoudreErreurFormulaire(erreur, [], t("error")).bandeau.join(" "),
      );
    }
  }

  return (
    <form onSubmit={enregistrer} noValidate>
      <FormSection titre={t("title")} aide={t("hint")}>
        {lignes.length === 0 ? (
          <p className="text-muted-foreground text-sm">{t("default")}</p>
        ) : (
          <ul className="space-y-2">
            {lignes.map((ligne, i) => (
              <li
                // Lignes éditables sans identifiant : l'index suffit,
                // l'ordre ne change qu'à l'enregistrement.
                key={i}
                className="flex flex-wrap items-center gap-2 rounded-md border p-2 text-sm sm:border-0 sm:p-0"
              >
                <span>{t("from")}</span>
                <Input
                  aria-label={t("daysLabel", { index: i + 1 })}
                  inputMode="numeric"
                  className="w-20 font-mono"
                  value={ligne.jours}
                  onChange={(e) => modifier(i, "jours", e.target.value)}
                />
                <span>{t("daysBefore")}</span>
                <Input
                  aria-label={t("rateLabel", { index: i + 1 })}
                  inputMode="numeric"
                  className="w-20 font-mono"
                  value={ligne.pourcentage}
                  onChange={(e) => modifier(i, "pourcentage", e.target.value)}
                />
                <span>{t("refunded")}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-sm"
                  aria-label={t("remove", { index: i + 1 })}
                  onClick={() => setLignes((l) => l.filter((_, j) => j !== i))}
                >
                  <Trash2 aria-hidden className="size-4" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        {lignes.length > 0 && (
          <p className="text-muted-foreground text-xs">{t("below")}</p>
        )}
        {"erreur" in lu && lignes.length > 0 && (
          <p role="alert" className="text-destructive text-sm">
            {t(`errors.${lu.erreur}`)}
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={lignes.length >= MAX_PALIERS}
            onClick={() =>
              setLignes((l) => [...l, { jours: "", pourcentage: "" }])
            }
          >
            <Plus aria-hidden className="size-4" />
            {t("add")}
          </Button>
          <Button
            type="submit"
            disabled={"erreur" in lu || enregistrement.isPending}
          >
            {t("save")}
          </Button>
        </div>
        <p className="text-muted-foreground text-xs">{t("frozen")}</p>
      </FormSection>
    </form>
  );
}
