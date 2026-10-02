"use client";

import { useMemo, useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Form } from "@/components/ui/form";
import { ApiError } from "@/lib/api/types";
import { useReinitialisationMotDePasse } from "../api/use-auth";
import { cleErreurConnexion } from "../lib/erreur-connexion";
import { BandeauErreur, BoutonEnvoi } from "./champs";
import { ChampNouveauMotDePasse } from "./ChampsFormulaire";

/**
 * Choix du nouveau mot de passe depuis le lien reçu par e-mail. Le jeton
 * est dans le **fragment** (`#token=…`, ADR 0026 du backend) : il n'est
 * jamais envoyé au serveur web, seulement lu ici puis transmis une fois au
 * backend. Rien n'est conservé dans le navigateur.
 */
const LONGUEUR_JETON = 43;

function abonnerHash(rappel: () => void) {
  globalThis.addEventListener("hashchange", rappel);
  return () => globalThis.removeEventListener("hashchange", rappel);
}

function lireJeton(): string | null {
  const jeton = new URLSearchParams(globalThis.location.hash.slice(1)).get(
    "token",
  );
  return jeton?.length === LONGUEUR_JETON ? jeton : null;
}

function LienNouvelleDemande({ message }: Readonly<{ message: string }>) {
  const t = useTranslations("auth.reset");
  return (
    <div className="space-y-4">
      <BandeauErreur message={message} />
      <Link
        href="/forgot-password"
        className="text-primary inline-block font-medium hover:underline"
      >
        {t("newLink")}
      </Link>
    </div>
  );
}

export function ResetPasswordForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const jeton = useSyncExternalStore(abonnerHash, lireJeton, () => null);
  const reinitialisation = useReinitialisationMotDePasse();
  const [bandeau, setBandeau] = useState<string | null>(null);
  const [lienInvalide, setLienInvalide] = useState(false);

  const schema = useMemo(
    () =>
      z
        .object({
          password: z
            .string()
            .min(8, t("reset.tooShort"))
            .max(72, t("reset.tooLong")),
          confirm: z.string(),
        })
        .refine((v) => v.password === v.confirm, {
          path: ["confirm"],
          message: t("reset.mismatch"),
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: { password: "", confirm: "" },
  });

  if (!jeton) {
    return <LienNouvelleDemande message={t("reset.missingLink")} />;
  }
  if (lienInvalide) {
    return <LienNouvelleDemande message={t("reset.invalidLink")} />;
  }

  async function soumettre({ password }: Valeurs) {
    if (!jeton) return;
    setBandeau(null);
    try {
      await reinitialisation.mutateAsync({
        token: jeton,
        newPassword: password,
      });
      router.replace("/login?reset=1");
    } catch (erreur) {
      if (erreur instanceof ApiError && erreur.statusCode === 400) {
        setLienInvalide(true);
        return;
      }
      setBandeau(t(cleErreurConnexion(erreur, "common.genericError")));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(soumettre)}
        className="space-y-5"
        noValidate
      >
        <ChampNouveauMotDePasse
          control={form.control}
          name="password"
          label={t("reset.password")}
          aide={t("reset.passwordHint")}
        />
        <ChampNouveauMotDePasse
          control={form.control}
          name="confirm"
          label={t("reset.confirm")}
        />
        <BandeauErreur message={bandeau} />
        <BoutonEnvoi enCours={reinitialisation.isPending}>
          {t("reset.submit")}
        </BoutonEnvoi>
      </form>
    </Form>
  );
}
