"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Loader2, ShieldAlert } from "lucide-react";
import { Can } from "@/components/shared/Can";
import { FormSection } from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";
import { ApiError } from "@/lib/api/types";
import { formatTelephone } from "@/lib/format";
import {
  useMettreAJourProfil,
  type MiseAJourProfil,
  type Utilisateur,
} from "@/lib/auth/use-current-user";

/**
 * Profil de l'utilisateur courant (ticket #30). Le contact d'urgence reçoit
 * le SMS du SOS (`GroupsService.triggerSos`) : un pèlerin est invité à le
 * renseigner. Passeport et groupe sanguin ne sont jamais journalisés.
 */

const GROUPES_SANGUINS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;

function Lecture({
  libelle,
  valeur,
  mono = false,
}: Readonly<{ libelle: string; valeur: string; mono?: boolean }>) {
  return (
    <div className="space-y-1">
      <dt className="text-muted-foreground text-sm">{libelle}</dt>
      <dd className={mono ? "font-mono" : "font-medium"}>{valeur}</dd>
    </div>
  );
}

export function ProfileForm({
  utilisateur,
}: Readonly<{ utilisateur: Utilisateur }>) {
  const t = useTranslations("profile");
  const tNav = useTranslations("nav");
  const miseAJour = useMettreAJourProfil();
  const [retour, setRetour] = useState<{
    type: "succes" | "erreur";
    message: string;
  } | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().trim().min(2, t("fullNameInvalid")),
          contactNom: z.string().trim(),
          contactTelephone: z.string().trim(),
          contactLien: z.string().trim(),
          bloodType: z.string(),
          passportNumber: z.string().trim(),
        })
        .refine((v) => (v.contactNom === "") === (v.contactTelephone === ""), {
          path: ["contactTelephone"],
          message: t("emergencyIncomplete"),
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      fullName: utilisateur.fullName,
      contactNom: utilisateur.emergencyContact?.fullName ?? "",
      contactTelephone: utilisateur.emergencyContact?.phone ?? "",
      contactLien: utilisateur.emergencyContact?.relationship ?? "",
      bloodType: utilisateur.bloodType ?? "",
      passportNumber: utilisateur.passportNumber ?? "",
    },
  });

  async function enregistrer(valeurs: Valeurs) {
    setRetour(null);
    const corps: MiseAJourProfil = {
      fullName: valeurs.fullName,
      ...(valeurs.contactNom
        ? {
            emergencyContact: {
              fullName: valeurs.contactNom,
              phone: valeurs.contactTelephone,
              ...(valeurs.contactLien
                ? { relationship: valeurs.contactLien }
                : {}),
            },
          }
        : {}),
      ...(valeurs.bloodType ? { bloodType: valeurs.bloodType } : {}),
      ...(valeurs.passportNumber
        ? { passportNumber: valeurs.passportNumber }
        : {}),
    };
    try {
      await miseAJour.mutateAsync(corps);
      setRetour({ type: "succes", message: t("saved") });
    } catch (erreur) {
      if (erreur instanceof ApiError && erreur.statusCode === 400) {
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["fullName", "bloodType", "passportNumber"],
          "",
        );
      }
      setRetour({ type: "erreur", message: t("error") });
    }
  }

  const sansContact = !utilisateur.emergencyContact;

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(enregistrer)}
        noValidate
        className="max-w-(--content-form) space-y-6 pb-24 sm:pb-0"
      >
        <Can role="pilgrim">
          {sansContact && (
            <p className="bg-state-warning-bg text-state-warning flex gap-3 rounded-lg px-4 py-3 text-sm font-medium">
              <ShieldAlert aria-hidden className="size-5 shrink-0" />
              {t("emergencyMissing")}
            </p>
          )}
        </Can>

        <FormSection titre={t("identity")}>
          <FormField
            control={form.control}
            name="fullName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("fullName")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="name"
                    className="h-(--size-touch)"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <dl className="grid gap-4 sm:grid-cols-2">
            {utilisateur.email && (
              <Lecture libelle={t("email")} valeur={utilisateur.email} />
            )}
            {utilisateur.phone && (
              <Lecture
                libelle={t("phone")}
                valeur={formatTelephone(utilisateur.phone)}
                mono
              />
            )}
            <Lecture
              libelle={t("role")}
              valeur={tNav(`roles.${utilisateur.role}`)}
            />
            <Lecture libelle={t("language")} valeur={t("languageValue")} />
          </dl>
        </FormSection>

        <FormSection titre={t("emergency")} aide={t("emergencyHint")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="contactNom"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emergencyName")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      className="h-(--size-touch)"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="contactTelephone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("emergencyPhone")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      inputMode="tel"
                      autoComplete="off"
                      className="h-(--size-touch) font-mono"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="contactLien"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("emergencyRelationship")}</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    autoComplete="off"
                    placeholder={t("emergencyRelationshipPlaceholder")}
                    className="h-(--size-touch)"
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </FormSection>

        <FormSection titre={t("health")} aide={t("healthHint")}>
          <div className="grid gap-5 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="bloodType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("bloodType")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border-input bg-background h-(--size-touch) w-full rounded-md border px-3 text-sm"
                    >
                      <option value="">{t("bloodTypeUnknown")}</option>
                      {GROUPES_SANGUINS.map((groupe) => (
                        <option key={groupe} value={groupe}>
                          {groupe}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="passportNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("passportNumber")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      autoComplete="off"
                      spellCheck={false}
                      className="h-(--size-touch) font-mono uppercase"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </FormSection>

        <div className="bg-background/95 fixed inset-x-0 bottom-0 z-10 flex items-center gap-4 border-t p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button
            type="submit"
            disabled={miseAJour.isPending}
            className="bg-primary hover:bg-primary-hover h-(--size-touch) px-6"
          >
            {miseAJour.isPending && (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            )}
            {t("save")}
          </Button>
          {retour?.type === "succes" && (
            <output className="text-state-success text-sm font-medium">
              {retour.message}
            </output>
          )}
          {retour?.type === "erreur" && (
            <p role="alert" className="text-state-danger text-sm font-medium">
              {retour.message}
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}
