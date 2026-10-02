"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { toast } from "sonner";
import { useDeposerAvis } from "../api/use-reviews";
import { RatingInput } from "./RatingInput";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ApiError } from "@/lib/api/types";

/**
 * Avis sur une réservation confirmée ou terminée (ticket #59) : note
 * obligatoire, commentaire facultatif. Un 409 (avis déjà déposé) est
 * interprété par son statut, jamais par le texte du message.
 */
const LONGUEUR_MAX_COMMENTAIRE = 1000;

export function ReviewDialog({ bookingId }: Readonly<{ bookingId: string }>) {
  const t = useTranslations("reviews.form");
  const tc = useTranslations("common");
  const depot = useDeposerAvis();
  const [ouvert, setOuvert] = useState(false);
  const [note, setNote] = useState(0);
  const [commentaire, setCommentaire] = useState("");
  const [erreurs, setErreurs] = useState<string[]>([]);

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      setNote(0);
      setCommentaire("");
      setErreurs([]);
    }
  }

  async function envoyer() {
    if (note === 0) {
      setErreurs([t("ratingRequired")]);
      return;
    }
    setErreurs([]);
    const texte = commentaire.trim();
    try {
      await depot.mutateAsync({
        bookingId,
        rating: note,
        ...(texte ? { comment: texte } : {}),
      });
      toast.success(t("sent"));
      changerOuverture(false);
    } catch (erreur) {
      const deja = erreur instanceof ApiError && erreur.statusCode === 409;
      setErreurs([deja ? t("alreadyReviewed") : t("error")]);
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button variant="outline">
          <Star aria-hidden className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(evenement) => {
            evenement.preventDefault();
            envoyer().catch(() => undefined);
          }}
        >
          <RatingInput
            legend={t("rating")}
            value={note}
            onChange={setNote}
            invalid={erreurs.length > 0 && note === 0}
          />
          <div className="space-y-2">
            <Label htmlFor={`avis-${bookingId}`}>{t("comment")}</Label>
            <Textarea
              id={`avis-${bookingId}`}
              rows={4}
              maxLength={LONGUEUR_MAX_COMMENTAIRE}
              value={commentaire}
              onChange={(e) => setCommentaire(e.target.value)}
              placeholder={t("commentPlaceholder")}
            />
          </div>
          <FormErrorBanner messages={erreurs} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changerOuverture(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={depot.isPending}>
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
