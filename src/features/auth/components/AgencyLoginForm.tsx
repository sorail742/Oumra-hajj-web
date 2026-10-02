"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";
import { ApiError } from "@/lib/api/types";
import { useConnexionAgence } from "../api/use-auth";
import { cleErreurConnexion } from "../lib/erreur-connexion";
import { destinationApresConnexion } from "../lib/redirection";
import { ChampEmail, schemaEmail } from "./ChampsFormulaire";
import { BandeauErreur, BoutonEnvoi, ChampMotDePasse } from "./champs";

/**
 * Connexion agence / admin (email + mot de passe). Le mot de passe n'est
 * ni journalisé ni conservé : il part dans une seule requête vers
 * `/api/session/agency`, qui pose les cookies de session.
 */
export function AgencyLoginForm({ next }: Readonly<{ next?: string }>) {
  const t = useTranslations("auth");
  const router = useRouter();
  const connexion = useConnexionAgence();
  const [bandeau, setBandeau] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        email: schemaEmail(t("agency.emailInvalid")),
        password: z.string().min(8, t("agency.passwordTooShort")),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: { email: "", password: "" },
  });

  async function soumettre(valeurs: Valeurs) {
    setBandeau(null);
    try {
      await connexion.mutateAsync(valeurs);
      router.replace(destinationApresConnexion(next));
      router.refresh();
    } catch (erreur) {
      if (erreur instanceof ApiError && erreur.statusCode === 400) {
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["email", "password"],
          "",
        );
      }
      setBandeau(t(cleErreurConnexion(erreur, "agency.invalid")));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(soumettre)}
        className="space-y-5"
        noValidate
      >
        <ChampEmail
          control={form.control}
          name="email"
          label={t("agency.email")}
        />
        <FormField
          control={form.control}
          name="password"
          render={({ field }) => (
            <FormItem>
              <div className="flex items-center justify-between">
                <FormLabel>{t("agency.password")}</FormLabel>
                <Link
                  href="/forgot-password"
                  className="text-primary text-sm hover:underline"
                >
                  {t("agency.forgot")}
                </Link>
              </div>
              <FormControl>
                <ChampMotDePasse {...field} autoComplete="current-password" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <BandeauErreur message={bandeau} />
        <BoutonEnvoi enCours={connexion.isPending}>
          {t("agency.submit")}
        </BoutonEnvoi>
      </form>
    </Form>
  );
}
