"use client";

import { useState, type SyntheticEvent } from "react";
import { useTranslations } from "next-intl";
import { Mail, MessageSquareText } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { cn } from "cn";
import {
  normaliserEmail,
  type Canal,
  type Destinataire,
} from "../lib/destinataire";
import { normaliserTelephone } from "../lib/telephone";
import { BandeauErreur, BoutonEnvoi } from "./champs";

/**
 * Première étape de la connexion pèlerin / guide : choix du canal (e-mail
 * via EmailJS, ou SMS — ADR 0025 du backend) puis saisie du destinataire.
 * L'e-mail est proposé d'abord : c'est le seul canal réellement livré tant
 * qu'aucun fournisseur SMS n'est retenu.
 */

const CANAUX = [
  { canal: "email", icone: Mail, cle: "channelEmail" },
  { canal: "sms", icone: MessageSquareText, cle: "channelSms" },
] as const;

export function DemandeCodeForm({
  enCours,
  bandeau,
  onDemande,
}: Readonly<{
  enCours: boolean;
  bandeau: string | null;
  onDemande: (destinataire: Destinataire) => void;
}>) {
  const t = useTranslations("auth.otp");
  const [canal, setCanal] = useState<Canal>("email");
  const [saisie, setSaisie] = useState("");
  const [erreur, setErreur] = useState<string | null>(null);
  const parEmail = canal === "email";

  function changerCanal(nouveau: Canal) {
    setCanal(nouveau);
    setSaisie("");
    setErreur(null);
  }

  function soumettre(evenement: SyntheticEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (parEmail) {
      const email = normaliserEmail(saisie);
      if (!email) {
        setErreur(t("emailInvalid"));
        return;
      }
      setErreur(null);
      onDemande({ email });
      return;
    }
    const phone = normaliserTelephone(saisie);
    if (!phone) {
      setErreur(t("phoneInvalid"));
      return;
    }
    setErreur(null);
    onDemande({ phone });
  }

  return (
    <form onSubmit={soumettre} className="space-y-5" noValidate>
      <div className="space-y-2">
        <p className="text-sm font-medium">{t("channelLabel")}</p>
        <SegmentedControl
          label={t("channelLabel")}
          value={canal}
          onChange={changerCanal}
          className="grid w-full grid-cols-2"
          options={CANAUX.map(({ canal: valeur, icone, cle }) => ({
            value: valeur,
            label: t(cle),
            icon: icone,
          }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="otp-destinataire">
          {parEmail ? t("email") : t("phone")}
        </Label>
        <Input
          id="otp-destinataire"
          type={parEmail ? "email" : "tel"}
          inputMode={parEmail ? "email" : "tel"}
          autoComplete={parEmail ? "email" : "tel"}
          placeholder={parEmail ? t("emailPlaceholder") : t("phonePlaceholder")}
          value={saisie}
          onChange={(e) => setSaisie(e.target.value)}
          aria-invalid={erreur !== null}
          aria-describedby="otp-destinataire-aide"
          className={cn(
            "h-(--size-touch) text-base",
            !parEmail && "font-mono tracking-wide",
          )}
        />
        <p
          id="otp-destinataire-aide"
          className={
            erreur
              ? "text-destructive text-sm"
              : "text-muted-foreground text-sm"
          }
        >
          {erreur ?? (parEmail ? t("emailHint") : t("phoneHint"))}
        </p>
      </div>
      <BandeauErreur message={bandeau} />
      <BoutonEnvoi enCours={enCours}>{t("sendCode")}</BoutonEnvoi>
    </form>
  );
}
