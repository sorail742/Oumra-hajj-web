"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { FormSection } from "@/components/shared/FormSection";
import { Button } from "@/components/ui/button";
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
import { Textarea } from "@/components/ui/textarea";
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";
import type { Agency } from "../api/schemas";
import { useUpdateMyAgency, type MiseAJourAgence } from "../api/use-my-agency";

/**
 * Modification du profil de l'agence (ticket #47) : adresse, mentions
 * légales des factures (NIF, RCCM — idée #37) et coordonnées bancaires. Les trois champs bancaires vont ensemble (le
 * backend les exige ensemble). Le numéro de compte n'est jamais
 * pré-rempli : tant qu'il reste vide, les coordonnées existantes ne sont
 * pas modifiées.
 */
const CHAMPS_BANQUE = ["accountName", "bankName", "accountNumber"] as const;

export function MyAgencyForm({ agence }: Readonly<{ agence: Agency }>) {
  const t = useTranslations("myAgency");
  const miseAJour = useUpdateMyAgency();
  const [retour, setRetour] = useState<{
    type: "succes" | "erreur";
    message: string;
  } | null>(null);

  const schema = useMemo(
    () =>
      z
        .object({
          address: z.string().trim().max(300),
          taxId: z.string().trim().max(40),
          tradeRegister: z.string().trim().max(60),
          accountName: z.string().trim().max(120),
          bankName: z.string().trim().max(120),
          accountNumber: z.string().trim().max(64),
        })
        .refine(
          (v) =>
            v.accountNumber === "" ||
            (v.accountName !== "" && v.bankName !== ""),
          { path: ["accountName"], message: t("bankIncomplete") },
        )
        .refine(
          (v) =>
            agence.bankDetails !== undefined ||
            v.accountNumber !== "" ||
            (v.accountName === "" && v.bankName === ""),
          { path: ["accountNumber"], message: t("bankIncomplete") },
        ),
    [t, agence.bankDetails],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      address: agence.address ?? "",
      taxId: agence.taxId ?? "",
      tradeRegister: agence.tradeRegister ?? "",
      accountName: agence.bankDetails?.accountName ?? "",
      bankName: agence.bankDetails?.bankName ?? "",
      // Jamais pré-rempli : le numéro n'est ressaisi que pour le changer.
      accountNumber: "",
    },
  });

  async function enregistrer(valeurs: Valeurs) {
    setRetour(null);
    const corps: MiseAJourAgence = {
      ...(valeurs.address ? { address: valeurs.address } : {}),
      ...(valeurs.taxId ? { taxId: valeurs.taxId } : {}),
      ...(valeurs.tradeRegister
        ? { tradeRegister: valeurs.tradeRegister }
        : {}),
      ...(valeurs.accountNumber
        ? {
            bankDetails: {
              accountName: valeurs.accountName,
              accountNumber: valeurs.accountNumber,
              bankName: valeurs.bankName,
            },
          }
        : {}),
    };
    try {
      await miseAJour.mutateAsync(corps);
      form.resetField("accountNumber", { defaultValue: "" });
      setRetour({ type: "succes", message: t("saved") });
    } catch (erreur) {
      appliquerErreurFormulaire(erreur, form.setError, ["address"], "");
      setRetour({ type: "erreur", message: t("error") });
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(enregistrer)}
        className="space-y-6"
        noValidate
      >
        <FormSection titre={t("addressTitle")}>
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("address")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </FormSection>
        <FormSection titre={t("legalIdsTitle")} aide={t("legalIdsHint")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {(["taxId", "tradeRegister"] as const).map((nom) => (
              <FormField
                key={nom}
                control={form.control}
                name={nom}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(nom)}</FormLabel>
                    <FormControl>
                      <Input {...field} className="font-mono" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </FormSection>
        <FormSection titre={t("bankTitle")} aide={t("bankHint")}>
          <div className="grid gap-4 sm:grid-cols-2">
            {CHAMPS_BANQUE.map((nom) => (
              <FormField
                key={nom}
                control={form.control}
                name={nom}
                render={({ field }) => (
                  <FormItem
                    className={nom === "accountNumber" ? "sm:col-span-2" : ""}
                  >
                    <FormLabel>{t(nom)}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        autoComplete="off"
                        className={
                          nom === "accountNumber" ? "font-mono" : undefined
                        }
                      />
                    </FormControl>
                    {nom === "accountNumber" && agence.bankDetails && (
                      <FormDescription>
                        {t("accountNumberHint")}
                      </FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </FormSection>
        {retour && (
          <p
            role={retour.type === "erreur" ? "alert" : undefined}
            className={
              retour.type === "erreur"
                ? "bg-state-danger-bg text-state-danger rounded-md px-3 py-2 text-sm"
                : "bg-state-success-bg text-state-success rounded-md px-3 py-2 text-sm"
            }
          >
            {retour.message}
          </p>
        )}
        <Button type="submit" disabled={miseAJour.isPending}>
          {miseAJour.isPending ? t("saving") : t("save")}
        </Button>
      </form>
    </Form>
  );
}
