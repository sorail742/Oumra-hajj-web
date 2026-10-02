"use client";

import { useEffect, useState, type SyntheticEvent } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatTelephone } from "@/lib/format";
import { useDemandeCode, useVerificationCode } from "../api/use-auth";
import { cleErreurConnexion } from "../lib/erreur-connexion";
import { destinationApresConnexion } from "../lib/redirection";
import { normaliserTelephone } from "../lib/telephone";
import { BandeauErreur, BandeauSucces, BoutonEnvoi } from "./champs";

/**
 * Connexion pèlerin / guide en deux temps : numéro de téléphone, puis code
 * reçu par SMS (`POST /auth/otp/request` puis `/api/session/otp`). Le
 * nom complet est demandé au même écran que le code : le backend ne
 * l'exige qu'à la création du compte, et l'ignore ensuite.
 */

const DELAI_RENVOI_S = 30;
const FORMAT_CODE = /^\d{4,8}$/;

export function OtpLoginFlow({ next }: Readonly<{ next?: string }>) {
  const t = useTranslations("auth");
  const router = useRouter();
  const demande = useDemandeCode();
  const verification = useVerificationCode();

  const [saisieTelephone, setSaisieTelephone] = useState("");
  const [telephone, setTelephone] = useState<string | null>(null);
  const [code, setCode] = useState("");
  const [nom, setNom] = useState("");
  const [erreurChamp, setErreurChamp] = useState<string | null>(null);
  const [bandeau, setBandeau] = useState<string | null>(null);
  const [attente, setAttente] = useState(0);

  useEffect(() => {
    if (attente <= 0) return undefined;
    const minuteur = setTimeout(() => setAttente((s) => s - 1), 1000);
    return () => clearTimeout(minuteur);
  }, [attente]);

  async function envoyerCode(numero: string) {
    setBandeau(null);
    try {
      await demande.mutateAsync(numero);
      setTelephone(numero);
      setAttente(DELAI_RENVOI_S);
    } catch (erreur) {
      setBandeau(t(cleErreurConnexion(erreur, "otp.phoneInvalid")));
    }
  }

  function soumettreTelephone(evenement: SyntheticEvent<HTMLFormElement>) {
    evenement.preventDefault();
    const numero = normaliserTelephone(saisieTelephone);
    if (!numero) {
      setErreurChamp(t("otp.phoneInvalid"));
      return;
    }
    setErreurChamp(null);
    envoyerCode(numero).catch(() => undefined);
  }

  async function verifierCode(numero: string) {
    setErreurChamp(null);
    setBandeau(null);
    try {
      const nomSaisi = nom.trim();
      await verification.mutateAsync({
        phone: numero,
        code,
        ...(nomSaisi.length >= 2 ? { fullName: nomSaisi } : {}),
      });
      router.replace(destinationApresConnexion(next));
      router.refresh();
    } catch (erreur) {
      setBandeau(t(cleErreurConnexion(erreur, "otp.wrongCode")));
    }
  }

  function soumettreCode(evenement: SyntheticEvent<HTMLFormElement>) {
    evenement.preventDefault();
    if (!telephone) return;
    if (!FORMAT_CODE.test(code)) {
      setErreurChamp(t("otp.codeInvalid"));
      return;
    }
    verifierCode(telephone).catch(() => undefined);
  }

  if (!telephone) {
    return (
      <form onSubmit={soumettreTelephone} className="space-y-5" noValidate>
        <div className="space-y-2">
          <Label htmlFor="otp-telephone">{t("otp.phone")}</Label>
          <Input
            id="otp-telephone"
            type="tel"
            inputMode="tel"
            autoComplete="tel"
            placeholder={t("otp.phonePlaceholder")}
            value={saisieTelephone}
            onChange={(e) => setSaisieTelephone(e.target.value)}
            aria-invalid={erreurChamp !== null}
            aria-describedby="otp-telephone-aide"
            className="h-(--size-touch) font-mono text-base tracking-wide"
          />
          <p
            id="otp-telephone-aide"
            className={
              erreurChamp
                ? "text-destructive text-sm"
                : "text-muted-foreground text-sm"
            }
          >
            {erreurChamp ?? t("otp.phoneHint")}
          </p>
        </div>
        <BandeauErreur message={bandeau} />
        <BoutonEnvoi enCours={demande.isPending}>
          {t("otp.sendCode")}
        </BoutonEnvoi>
      </form>
    );
  }

  return (
    <form onSubmit={soumettreCode} className="space-y-5" noValidate>
      <BandeauSucces
        message={t("otp.codeSent", { phone: formatTelephone(telephone) })}
      />
      <div className="space-y-2">
        <Label htmlFor="otp-code">{t("otp.code")}</Label>
        <Input
          id="otp-code"
          inputMode="numeric"
          autoComplete="one-time-code"
          maxLength={8}
          value={code}
          onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
          aria-invalid={erreurChamp !== null}
          aria-describedby={erreurChamp ? "otp-code-erreur" : undefined}
          className="h-14 text-center font-mono text-2xl tracking-[0.5em]"
          autoFocus
        />
        {erreurChamp && (
          <p id="otp-code-erreur" className="text-destructive text-sm">
            {erreurChamp}
          </p>
        )}
      </div>
      <div className="space-y-2">
        <Label htmlFor="otp-nom">{t("otp.fullName")}</Label>
        <Input
          id="otp-nom"
          autoComplete="name"
          value={nom}
          onChange={(e) => setNom(e.target.value)}
          aria-describedby="otp-nom-aide"
          className="h-(--size-touch)"
        />
        <p id="otp-nom-aide" className="text-muted-foreground text-sm">
          {t("otp.fullNameHint")}
        </p>
      </div>
      <BandeauErreur message={bandeau} />
      <BoutonEnvoi enCours={verification.isPending}>
        {t("otp.verify")}
      </BoutonEnvoi>
      <div className="flex items-center justify-between text-sm">
        <button
          type="button"
          onClick={() => {
            setTelephone(null);
            setCode("");
            setBandeau(null);
            setErreurChamp(null);
          }}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("otp.changePhone")}
        </button>
        <button
          type="button"
          disabled={attente > 0 || demande.isPending}
          onClick={() => {
            envoyerCode(telephone).catch(() => undefined);
          }}
          className="text-primary font-medium hover:underline disabled:text-muted-foreground disabled:no-underline"
        >
          {attente > 0
            ? t("otp.resendIn", { seconds: attente })
            : t("otp.resend")}
        </button>
      </div>
    </form>
  );
}
