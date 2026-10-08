"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/types";
import { useDeposerDocumentLegal } from "../api/use-legal-documents";

/**
 * Dépôt d'un document légal par l'agence (ticket #48) : intitulé
 * obligatoire, échéance facultative — un document sans échéance (statuts
 * de société…) ne reçoit jamais de date arbitraire. Taille et format
 * vérifiés avant envoi par `FileDropzone`, aucun aperçu (règle 14).
 */
const LONGUEUR_MIN_INTITULE = 2;

function cleErreur(erreur: unknown): "tooLarge" | "invalid" | "error" {
  if (erreur instanceof ApiError) {
    if (erreur.statusCode === 413) return "tooLarge";
    if (erreur.statusCode === 400) return "invalid";
  }
  return "error";
}

export function LegalDocumentUploader() {
  const t = useTranslations("agencyCompliance.upload");
  const depot = useDeposerDocumentLegal();
  const [intitule, setIntitule] = useState("");
  const [echeance, setEcheance] = useState("");
  const [erreur, setErreur] = useState<string | undefined>(undefined);
  const [succes, setSucces] = useState(false);
  // Change après chaque dépôt réussi : remonte la zone de dépôt, vidée.
  const [generation, setGeneration] = useState(0);

  async function deposer(fichier: File) {
    setSucces(false);
    if (intitule.trim().length < LONGUEUR_MIN_INTITULE) {
      setErreur(t("labelRequired"));
      return;
    }
    setErreur(undefined);
    try {
      await depot.mutateAsync({
        fichier,
        label: intitule.trim(),
        ...(echeance ? { expiresAt: echeance } : {}),
      });
      setSucces(true);
      setIntitule("");
      setEcheance("");
      setGeneration((g) => g + 1);
    } catch (cause) {
      setErreur(t(`errors.${cleErreur(cause)}`));
    }
  }

  return (
    <section
      aria-labelledby="depot-document-legal"
      className="bg-card space-y-5 rounded-lg border p-5 shadow-(--shadow-card)"
    >
      <div className="space-y-1">
        <h2 id="depot-document-legal" className="text-base font-semibold">
          {t("title")}
        </h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="document-legal-intitule">{t("label")}</Label>
          <Input
            id="document-legal-intitule"
            value={intitule}
            onChange={(e) => setIntitule(e.target.value)}
            placeholder={t("labelPlaceholder")}
            className="h-(--size-touch)"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="document-legal-echeance">{t("expiresAt")}</Label>
          <Input
            id="document-legal-echeance"
            type="date"
            value={echeance}
            onChange={(e) => setEcheance(e.target.value)}
            aria-describedby="document-legal-echeance-aide"
            className="h-(--size-touch)"
          />
          <p
            id="document-legal-echeance-aide"
            className="text-muted-foreground text-xs"
          >
            {t("expiresAtHint")}
          </p>
        </div>
      </div>
      <FileDropzone
        key={generation}
        onSubmit={(fichier) => {
          deposer(fichier).catch(() => undefined);
        }}
        isPending={depot.isPending}
        error={erreur}
      />
      {succes && (
        <output className="bg-state-success-bg text-state-success block rounded-md px-3 py-2 text-sm font-medium">
          {t("success")}
        </output>
      )}
    </section>
  );
}
