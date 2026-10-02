"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Circle, Clock, X } from "lucide-react";
import { cn } from "cn";
import { FileDropzone } from "@/components/shared/FileDropzone";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ApiError } from "@/lib/api/types";
import { useDeposerDocument, useMyDocuments } from "../api/use-documents";
import type { PilgrimDocument } from "../api/schemas";
import { CLE_TRADUCTION_TYPE } from "../lib/document-type";

/**
 * Dépôt d'un document pour une réservation (ticket #36), côté pèlerin.
 * Rappelle les pièces du dossier et leur statut, puis dépose via
 * `FileDropzone` (taille et format vérifiés avant envoi, aucun aperçu —
 * règle 14). La date d'expiration n'est proposée que là où elle a un sens.
 */

const TYPES = [
  "passport",
  "visa",
  "flight_ticket",
  "vaccination_certificate",
] as const;
const AVEC_EXPIRATION: ReadonlySet<PilgrimDocument["type"]> = new Set([
  "passport",
  "visa",
]);

function cleErreur(erreur: unknown): "tooLarge" | "forbidden" | "error" {
  if (erreur instanceof ApiError) {
    if (erreur.statusCode === 413) return "tooLarge";
    if (erreur.statusCode === 403 || erreur.statusCode === 404)
      return "forbidden";
  }
  return "error";
}

/** Le document le plus récent d'un type donne l'état de la pièce. */
function etatPiece(
  documents: readonly PilgrimDocument[],
  type: PilgrimDocument["type"],
) {
  return documents.findLast((d) => d.type === type);
}

function PiecesDuDossier({ bookingId }: Readonly<{ bookingId: string }>) {
  const t = useTranslations("documents");
  const { data } = useMyDocuments();
  const documents = (data ?? []).filter((d) => d.bookingId === bookingId);

  return (
    <div className="space-y-2">
      <p className="text-sm font-medium">{t("upload.progressTitle")}</p>
      <ul className="grid gap-2 sm:grid-cols-2">
        {TYPES.map((type) => {
          const piece = etatPiece(documents, type);
          const statut = piece?.status;
          return (
            <li
              key={type}
              className={cn(
                "flex items-start gap-3 rounded-lg border px-3 py-2.5 text-sm",
                statut === "validated" && "bg-state-success-bg",
                statut === "rejected" && "bg-state-danger-bg",
              )}
            >
              <span className="mt-0.5">
                {statut === "validated" && (
                  <Check aria-hidden className="text-state-success size-4" />
                )}
                {statut === "pending" && (
                  <Clock aria-hidden className="text-state-progress size-4" />
                )}
                {statut === "rejected" && (
                  <X aria-hidden className="text-state-danger size-4" />
                )}
                {!statut && (
                  <Circle
                    aria-hidden
                    className="text-muted-foreground size-4"
                  />
                )}
              </span>
              <span className="min-w-0">
                <span className="block font-medium">
                  {t(CLE_TRADUCTION_TYPE[type])}
                </span>
                {!statut && (
                  <span className="text-muted-foreground text-xs">
                    {t("upload.missing")}
                  </span>
                )}
                {statut === "rejected" && piece?.rejectionReason && (
                  <span className="text-state-danger text-xs">
                    {t("upload.rejectedHint", {
                      reason: piece.rejectionReason,
                    })}
                  </span>
                )}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function DocumentUploader({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("documents");
  const depot = useDeposerDocument();
  const [type, setType] = useState<PilgrimDocument["type"]>("passport");
  const [expiresAt, setExpiresAt] = useState("");
  const [succes, setSucces] = useState(false);
  const [erreur, setErreur] = useState<string | undefined>(undefined);
  // Change après chaque dépôt réussi : remonte la zone de dépôt, vidée.
  const [generation, setGeneration] = useState(0);

  async function deposer(fichier: File) {
    setErreur(undefined);
    setSucces(false);
    try {
      await depot.mutateAsync({
        bookingId,
        type,
        fichier,
        ...(AVEC_EXPIRATION.has(type) && expiresAt ? { expiresAt } : {}),
      });
      setSucces(true);
      setExpiresAt("");
      setGeneration((g) => g + 1);
    } catch (cause) {
      setErreur(t(`upload.${cleErreur(cause)}`));
    }
  }

  return (
    <section
      id="depot-pieces"
      aria-labelledby="depot-document"
      className="bg-card scroll-mt-6 space-y-5 rounded-xl border p-6 shadow-(--shadow-raised)"
    >
      <div className="space-y-1">
        <h2 id="depot-document" className="text-lg font-semibold">
          {t("upload.title")}
        </h2>
        <p className="text-muted-foreground text-sm">
          {t("upload.description")}
        </p>
      </div>

      <PiecesDuDossier bookingId={bookingId} />

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="depot-type">{t("upload.type")}</Label>
          <select
            id="depot-type"
            value={type}
            onChange={(e) => setType(e.target.value as PilgrimDocument["type"])}
            className="border-input bg-background h-(--size-touch) w-full rounded-md border px-3 text-sm"
          >
            {TYPES.map((valeur) => (
              <option key={valeur} value={valeur}>
                {t(CLE_TRADUCTION_TYPE[valeur])}
              </option>
            ))}
          </select>
        </div>
        {AVEC_EXPIRATION.has(type) && (
          <div className="space-y-2">
            <Label htmlFor="depot-expiration">{t("upload.expiresAt")}</Label>
            <Input
              id="depot-expiration"
              type="date"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              aria-describedby="depot-expiration-aide"
              className="h-(--size-touch)"
            />
            <p
              id="depot-expiration-aide"
              className="text-muted-foreground text-xs"
            >
              {t("upload.expiresAtHint")}
            </p>
          </div>
        )}
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
          {t("upload.success")}
        </output>
      )}
    </section>
  );
}
