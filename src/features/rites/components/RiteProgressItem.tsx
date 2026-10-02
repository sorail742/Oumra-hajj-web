"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { CheckCircle2, Circle, Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import { useResetCompteurs, useSyncRite } from "../api/use-rites";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
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

/**
 * Un rite et ses compteurs (ticket #79) : +1 / −1 sur le tawaf et le
 * sa'i, rite terminé, remise à zéro confirmée. Aucun nombre de tours
 * « attendu » n'est affiché : ce serait un contenu religieux que
 * l'interface n'a pas à affirmer (règle 13).
 */
export interface EtatRite {
  riteKey: string;
  titre: string;
  valide: boolean;
  completed: boolean;
  tawafCount: number;
  saiCount: number;
}

function Compteur({
  libelle,
  valeur,
  enCours,
  onChange,
}: Readonly<{
  libelle: string;
  valeur: number;
  enCours: boolean;
  onChange: (valeur: number) => void;
}>) {
  const t = useTranslations("rites.counter");
  return (
    <div className="flex items-center gap-2">
      <span className="w-12 text-sm">{libelle}</span>
      <Button
        variant="outline"
        size="icon"
        aria-label={t("decrement", { counter: libelle })}
        disabled={enCours || valeur === 0}
        onClick={() => onChange(valeur - 1)}
      >
        <Minus aria-hidden className="size-4" />
      </Button>
      <output
        aria-live="polite"
        aria-label={t("value", { counter: libelle, count: valeur })}
        className="w-8 text-center font-mono text-lg tabular-nums"
      >
        {valeur}
      </output>
      <Button
        variant="outline"
        size="icon"
        aria-label={t("increment", { counter: libelle })}
        disabled={enCours}
        onClick={() => onChange(valeur + 1)}
      >
        <Plus aria-hidden className="size-4" />
      </Button>
    </div>
  );
}

function RemiseAZero({ riteKey }: Readonly<{ riteKey: string }>) {
  const t = useTranslations("rites.counter");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const remise = useResetCompteurs(riteKey);

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("reset")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("resetTitle")}</DialogTitle>
          <DialogDescription>{t("resetBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            disabled={remise.isPending}
            onClick={() => {
              remise
                .mutateAsync()
                .then(() => setOuvert(false))
                .catch(() => toast.error(t("error")));
            }}
          >
            {t("resetConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RiteProgressItem({ etat }: Readonly<{ etat: EtatRite }>) {
  const t = useTranslations("rites");
  const sync = useSyncRite();

  function envoyer(
    changement: Partial<Omit<EtatRite, "riteKey" | "titre" | "valide">>,
  ) {
    sync
      .mutateAsync({ riteKey: etat.riteKey, ...changement })
      .catch(() => toast.error(t("counter.error")));
  }

  return (
    <li className="space-y-3 rounded-lg border p-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <span className="flex items-center gap-2 text-sm font-medium">
          {etat.completed ? (
            <CheckCircle2 className="text-state-success size-5" aria-hidden />
          ) : (
            <Circle className="text-muted-foreground size-5" aria-hidden />
          )}
          {etat.titre}
        </span>
        <Button
          variant={etat.completed ? "outline" : "default"}
          size="sm"
          aria-pressed={etat.completed}
          disabled={sync.isPending}
          onClick={() => envoyer({ completed: !etat.completed })}
        >
          {etat.completed ? t("counter.markNotDone") : t("counter.markDone")}
        </Button>
      </div>
      <div className="flex flex-wrap items-center gap-x-6 gap-y-2">
        <Compteur
          libelle={t("columnTawaf")}
          valeur={etat.tawafCount}
          enCours={sync.isPending}
          onChange={(tawafCount) => envoyer({ tawafCount })}
        />
        <Compteur
          libelle={t("columnSai")}
          valeur={etat.saiCount}
          enCours={sync.isPending}
          onChange={(saiCount) => envoyer({ saiCount })}
        />
        <RemiseAZero riteKey={etat.riteKey} />
      </div>
      <ReligiousContentNotice validated={etat.valide} />
    </li>
  );
}
