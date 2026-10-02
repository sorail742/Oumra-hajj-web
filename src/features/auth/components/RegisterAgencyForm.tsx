"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";
import { ApiError } from "@/lib/api/types";
import { useInscriptionAgence } from "../api/use-auth";
import { cleErreurConnexion } from "../lib/erreur-connexion";
import { normaliserTelephone } from "../lib/telephone";
import { BandeauErreur, BoutonEnvoi, ChampMotDePasse } from "./champs";

/**
 * Inscription d'une agence (`POST /agencies/register`). Aucune session
 * n'est ouverte : l'agence est renvoyée vers la connexion, avec un message
 * qui rappelle la validation à venir de ses documents légaux.
 */

const CHAMPS = [
  "legalName",
  "contactEmail",
  "contactPhone",
  "address",
  "password",
] as const;

export function RegisterAgencyForm() {
  const t = useTranslations("auth");
  const router = useRouter();
  const inscription = useInscriptionAgence();
  const [bandeau, setBandeau] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          legalName: z.string().trim().min(2, t("register.legalNameInvalid")),
          contactEmail: z
            .string()
            .trim()
            .pipe(z.email(t("agency.emailInvalid"))),
          contactPhone: z
            .string()
            .refine(
              (v) => normaliserTelephone(v) !== null,
              t("otp.phoneInvalid"),
            ),
          address: z.string().trim(),
          password: z.string().min(8, t("agency.passwordTooShort")),
          confirm: z.string(),
        })
        .refine((v) => v.password === v.confirm, {
          path: ["confirm"],
          message: t("register.mismatch"),
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      legalName: "",
      contactEmail: "",
      contactPhone: "",
      address: "",
      password: "",
      confirm: "",
    },
  });

  async function soumettre(valeurs: Valeurs) {
    setBandeau(null);
    try {
      await inscription.mutateAsync({
        legalName: valeurs.legalName,
        contactEmail: valeurs.contactEmail,
        contactPhone: normaliserTelephone(valeurs.contactPhone) ?? "",
        password: valeurs.password,
        ...(valeurs.address ? { address: valeurs.address } : {}),
      });
      router.push("/login?registered=1");
    } catch (erreur) {
      if (erreur instanceof ApiError && erreur.statusCode === 409) {
        form.setError("contactEmail", {
          type: "server",
          message: t("register.conflict"),
        });
        return;
      }
      if (erreur instanceof ApiError && erreur.statusCode === 400) {
        const restant = appliquerErreurFormulaire(
          erreur,
          form.setError,
          [...CHAMPS],
          t("common.genericError"),
        );
        setBandeau(restant[0] ?? null);
        return;
      }
      setBandeau(t(cleErreurConnexion(erreur, "common.genericError")));
    }
  }

  const champTexte = (
    name: "legalName" | "contactEmail" | "contactPhone" | "address",
    options: {
      label: string;
      type?: string;
      autoComplete: string;
      inputMode?: "email" | "tel";
      mono?: boolean;
    },
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{options.label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type={options.type ?? "text"}
              autoComplete={options.autoComplete}
              inputMode={options.inputMode}
              className={
                options.mono
                  ? "h-(--size-touch) font-mono tracking-wide"
                  : "h-(--size-touch)"
              }
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(soumettre)}
        className="space-y-5"
        noValidate
      >
        {champTexte("legalName", {
          label: t("register.legalName"),
          autoComplete: "organization",
        })}
        <div className="grid items-start gap-5 sm:grid-cols-2">
          {champTexte("contactEmail", {
            label: t("register.contactEmail"),
            type: "email",
            autoComplete: "email",
            inputMode: "email",
          })}
          {champTexte("contactPhone", {
            label: t("register.contactPhone"),
            type: "tel",
            autoComplete: "tel",
            inputMode: "tel",
            mono: true,
          })}
        </div>
        {champTexte("address", {
          label: t("register.address"),
          autoComplete: "street-address",
        })}
        <div className="grid items-start gap-5 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("register.password")}</FormLabel>
                <FormControl>
                  <ChampMotDePasse {...field} autoComplete="new-password" />
                </FormControl>
                <FormDescription>{t("register.passwordHint")}</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="confirm"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("register.confirm")}</FormLabel>
                <FormControl>
                  <ChampMotDePasse {...field} autoComplete="new-password" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <BandeauErreur message={bandeau} />
        <BoutonEnvoi enCours={inscription.isPending}>
          {t("register.submit")}
        </BoutonEnvoi>
      </form>
    </Form>
  );
}
