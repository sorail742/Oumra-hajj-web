"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ApiError } from "@/lib/api/types";
import { useDemandeReinitialisation } from "../api/use-auth";
import { cleErreurConnexion } from "../lib/erreur-connexion";
import { BandeauErreur, BandeauSucces, BoutonEnvoi } from "./champs";

/**
 * Demande d'un lien de réinitialisation (agence / admin). Le backend
 * répond pareil que le compte existe ou non : l'écran de confirmation ne
 * dit donc jamais « compte introuvable ».
 */
export function ForgotPasswordForm() {
  const t = useTranslations("auth");
  const demande = useDemandeReinitialisation();
  const [bandeau, setBandeau] = useState<string | null>(null);
  const [envoyeA, setEnvoyeA] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: z
          .string()
          .trim()
          .pipe(z.email(t("agency.emailInvalid"))),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: { email: "" },
  });

  async function soumettre({ email }: Valeurs) {
    setBandeau(null);
    const adresse = email.toLowerCase();
    try {
      await demande.mutateAsync(adresse);
      setEnvoyeA(adresse);
    } catch (erreur) {
      const indisponible =
        erreur instanceof ApiError && erreur.statusCode === 503;
      setBandeau(
        t(
          indisponible
            ? "forgot.unavailable"
            : cleErreurConnexion(erreur, "common.genericError"),
        ),
      );
    }
  }

  if (envoyeA) {
    return (
      <div className="space-y-4">
        <h2 className="text-base font-semibold">{t("forgot.sentTitle")}</h2>
        <BandeauSucces message={t("forgot.sent", { email: envoyeA })} />
        <button
          type="button"
          onClick={() => {
            setEnvoyeA(null);
            form.reset();
          }}
          className="text-primary text-sm font-medium hover:underline"
        >
          {t("forgot.retry")}
        </button>
      </div>
    );
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(soumettre)}
        className="space-y-5"
        noValidate
      >
        <FormField
          control={form.control}
          name="email"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("forgot.email")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  type="email"
                  autoComplete="email"
                  inputMode="email"
                  className="h-(--size-touch)"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <BandeauErreur message={bandeau} />
        <BoutonEnvoi enCours={demande.isPending}>
          {t("forgot.submit")}
        </BoutonEnvoi>
        <p className="text-muted-foreground text-sm">
          {t("forgot.pilgrimHint")}
        </p>
      </form>
    </Form>
  );
}
