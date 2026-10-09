"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { CalendarOff } from "lucide-react";
import { toast } from "sonner";
import { useAjouterIndisponibilite } from "../api/use-guide-planning";
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { resoudreErreurFormulaire } from "@/lib/api/form-errors";

/**
 * Indisponibilité d'un guide (idée #42) : congé, autre mission. Motif
 * court, jamais de détail médical.
 */
export function AddUnavailabilityDialog({
  guides,
}: Readonly<{ guides: readonly { id: string; name: string }[] }>) {
  const t = useTranslations("guidePlanning.add");
  const tc = useTranslations("common");
  const ajout = useAjouterIndisponibilite();
  const [ouvert, setOuvert] = useState(false);
  const [guideId, setGuideId] = useState("");
  const [debut, setDebut] = useState("");
  const [fin, setFin] = useState("");
  const [motif, setMotif] = useState("");
  const [bandeau, setBandeau] = useState<string[]>([]);
  const inversee = debut !== "" && fin !== "" && fin < debut;
  const valide = guideId !== "" && debut !== "" && fin !== "" && !inversee;

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      setGuideId("");
      setDebut("");
      setFin("");
      setMotif("");
      setBandeau([]);
    }
  }

  async function ajouter(e: FormEvent) {
    e.preventDefault();
    if (!valide) return;
    setBandeau([]);
    try {
      await ajout.mutateAsync({
        guideId,
        startDate: debut,
        endDate: fin,
        ...(motif.trim() && { reason: motif.trim() }),
      });
      toast.success(t("added"));
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(resoudreErreurFormulaire(erreur, [], t("error")).bandeau);
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button variant="outline" disabled={guides.length === 0}>
          <CalendarOff aria-hidden className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <form onSubmit={ajouter} className="space-y-4" noValidate>
          <div className="space-y-1">
            <Label htmlFor="indispo-guide">{t("guide")}</Label>
            <select
              id="indispo-guide"
              value={guideId}
              onChange={(e) => setGuideId(e.target.value)}
              className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
            >
              <option value="">{t("guidePlaceholder")}</option>
              {guides.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name}
                </option>
              ))}
            </select>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-1">
              <Label htmlFor="indispo-debut">{t("from")}</Label>
              <Input
                id="indispo-debut"
                type="date"
                value={debut}
                onChange={(e) => setDebut(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="indispo-fin">{t("to")}</Label>
              <Input
                id="indispo-fin"
                type="date"
                value={fin}
                onChange={(e) => setFin(e.target.value)}
              />
            </div>
          </div>
          {inversee && (
            <p role="alert" className="text-destructive text-sm">
              {t("inverted")}
            </p>
          )}
          <div className="space-y-1">
            <Label htmlFor="indispo-motif">{t("reason")}</Label>
            <Input
              id="indispo-motif"
              value={motif}
              maxLength={80}
              onChange={(e) => setMotif(e.target.value)}
              placeholder={t("reasonPlaceholder")}
            />
            <p className="text-muted-foreground text-xs">{t("reasonHint")}</p>
          </div>
          <FormErrorBanner messages={bandeau} />
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => changerOuverture(false)}
            >
              {tc("cancel")}
            </Button>
            <Button type="submit" disabled={!valide || ajout.isPending}>
              {t("submit")}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
