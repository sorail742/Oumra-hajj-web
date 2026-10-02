"use client";

import { useState } from "react";
import { useDropzone, type FileRejection } from "react-dropzone";
import { useTranslations } from "next-intl";
import { FileText, ImageIcon, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatTaille } from "@/lib/format";
import { cn } from "@/lib/utils";

/**
 * Limite du backend (`MAX_UPLOAD_SIZE_BYTES`, `DocumentsController` et
 * `AgenciesController`) — vérifiée ici avant envoi pour éviter un aller-retour
 * de 10 Mo voué à l'échec ; le backend reste la vraie barrière (règle 12).
 */
export const TAILLE_MAX_DOCUMENT_OCTETS = 10 * 1024 * 1024;

/**
 * Formats acceptés : documents scannés ou photographiés (passeport, visa,
 * billet, certificat de vaccination, documents légaux d'agence). Le backend
 * ne filtre aujourd'hui que la taille : ce filtre est une aide à la saisie.
 */
export const FORMATS_DOCUMENT = {
  "application/pdf": [".pdf"],
  "image/jpeg": [".jpg", ".jpeg"],
  "image/png": [".png"],
} as const;

export interface FileDropzoneProps {
  /** Appelé avec le fichier validé, quand l'utilisateur clique sur Envoyer. */
  onSubmit: (file: File) => void;
  /** Envoi en cours (mutation de l'écran). */
  isPending?: boolean;
  /** Erreur d'envoi déjà résolue par l'écran (`resoudreErreurFormulaire`). */
  error?: string;
  disabled?: boolean;
  className?: string;
}

function raisonDuRejet(
  rejet: FileRejection | undefined,
): "tooLarge" | "invalidType" | "tooMany" | "invalid" {
  const code = rejet?.errors[0]?.code;
  if (code === "file-too-large") return "tooLarge";
  if (code === "file-invalid-type") return "invalidType";
  if (code === "too-many-files") return "tooMany";
  return "invalid";
}

/**
 * Dépôt d'un document — glisser-déposer, clic, ou clavier (zone focalisable,
 * Entrée/Espace ouvrent le sélecteur).
 *
 * **Règle 14 (CLAUDE.md)** : aucun aperçu du contenu — ni miniature ni
 * `URL.createObjectURL` —, seuls le nom, le type et la taille s'affichent.
 * Le fichier ne vit que dans l'état de ce composant et disparaît avec lui.
 */
export function FileDropzone({
  onSubmit,
  isPending = false,
  error,
  disabled = false,
  className,
}: FileDropzoneProps) {
  const t = useTranslations("fileDropzone");
  const [fichier, setFichier] = useState<File | null>(null);
  const [rejet, setRejet] = useState<ReturnType<typeof raisonDuRejet> | null>(
    null,
  );
  const inactif = disabled || isPending;

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: FORMATS_DOCUMENT,
    maxSize: TAILLE_MAX_DOCUMENT_OCTETS,
    multiple: false,
    disabled: inactif,
    onDropAccepted: ([accepte]) => {
      setFichier(accepte ?? null);
      setRejet(null);
    },
    onDropRejected: (rejets) => {
      setFichier(null);
      setRejet(raisonDuRejet(rejets[0]));
    },
  });

  const messageErreur = rejet
    ? t(rejet, { max: formatTaille(TAILLE_MAX_DOCUMENT_OCTETS) })
    : error;
  const Icone = fichier?.type.startsWith("image/") ? ImageIcon : FileText;

  return (
    <div className={cn("space-y-3", className)}>
      <div
        {...getRootProps({
          "aria-label": t("zoneLabel"),
          "aria-describedby": "file-dropzone-aide",
          "aria-disabled": inactif,
          className: cn(
            "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed p-6 text-center text-sm transition-colors",
            "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
            isDragActive ? "border-primary bg-muted" : "border-border",
            inactif && "cursor-not-allowed opacity-60",
          ),
        })}
      >
        <input {...getInputProps()} data-testid="file-dropzone-input" />
        <Upload className="size-6 text-muted-foreground" aria-hidden />
        <p className="font-medium">
          {isDragActive ? t("dropHere") : t("prompt")}
        </p>
        <p id="file-dropzone-aide" className="text-muted-foreground">
          {t("hint", { max: formatTaille(TAILLE_MAX_DOCUMENT_OCTETS) })}
        </p>
      </div>

      {fichier && (
        <div className="flex items-center gap-3 rounded-lg border p-3 text-sm">
          <Icone
            className="size-5 shrink-0 text-muted-foreground"
            aria-hidden
          />
          <div className="min-w-0 flex-1">
            <div className="truncate font-medium">{fichier.name}</div>
            <div className="font-mono text-muted-foreground tabular-nums">
              {formatTaille(fichier.size)}
            </div>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={() => setFichier(null)}
            disabled={isPending}
            aria-label={t("remove")}
          >
            <X className="size-4" aria-hidden />
          </Button>
        </div>
      )}

      {messageErreur && (
        <p
          role="alert"
          className="rounded-md bg-state-danger-bg px-3 py-2 text-sm text-state-danger"
        >
          {messageErreur}
        </p>
      )}

      <Button
        type="button"
        onClick={() => fichier && onSubmit(fichier)}
        disabled={!fichier || inactif}
      >
        {isPending ? t("sending") : t("submit")}
      </Button>
    </div>
  );
}
