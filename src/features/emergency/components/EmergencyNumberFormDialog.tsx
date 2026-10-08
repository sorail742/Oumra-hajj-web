"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { DialogFormFooter } from "@/components/shared/DialogFormFooter";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { useEnregistrerNumero } from "../api/use-emergency";
import { CATEGORIES_URGENCE, type EmergencyNumber } from "../api/schemas";

/**
 * Saisie d'un numéro d'urgence par l'administrateur (idée #21). Aucun
 * numéro n'est proposé par défaut : seule l'administration, après
 * vérification, renseigne l'annuaire.
 */
const CHAMPS = [
  "label",
  "category",
  "phone",
  "country",
  "city",
  "notes",
  "order",
] as const;

export function EmergencyNumberFormDialog({
  numero,
}: Readonly<{ numero?: EmergencyNumber }>) {
  const t = useTranslations("emergency.manage");
  const tCat = useTranslations("emergency.category");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const enregistrement = useEnregistrerNumero(numero?.id);

  const schema = useMemo(
    () =>
      z.object({
        label: z.string().trim().min(2, t("labelTooShort")),
        category: z.enum(CATEGORIES_URGENCE),
        phone: z
          .string()
          .trim()
          .regex(/^\+?[0-9][0-9 ]{1,19}$/, t("phoneInvalid")),
        country: z
          .string()
          .trim()
          .regex(/^[A-Za-z]{2}$/, t("countryInvalid")),
        city: z.string().trim(),
        notes: z.string().trim(),
        order: z.string().regex(/^\d+$/, t("orderInvalid")),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const valeursInitiales: Valeurs = {
    label: numero?.label ?? "",
    category: numero?.category ?? "police",
    phone: numero?.phone ?? "",
    country: numero?.country ?? "SA",
    city: numero?.city ?? "",
    notes: numero?.notes ?? "",
    order: String(numero?.order ?? 0),
  };
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: valeursInitiales,
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      form.reset(valeursInitiales);
      setBandeau([]);
    }
  }

  async function enregistrer(v: Valeurs) {
    setBandeau([]);
    try {
      await enregistrement.mutateAsync({
        label: v.label,
        category: v.category,
        phone: v.phone,
        country: v.country.toUpperCase(),
        order: Number(v.order),
        ...(v.city ? { city: v.city } : {}),
        ...(v.notes ? { notes: v.notes } : {}),
      });
      toast.success(numero ? t("updated") : t("created"));
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(erreur, form.setError, CHAMPS, t("error")),
      );
    }
  }

  const champTexte = (
    nom: "label" | "phone" | "country" | "city" | "notes" | "order",
  ) => (
    <FormField
      key={nom}
      control={form.control}
      name={nom}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(nom)}</FormLabel>
          <FormControl>
            <Input
              {...field}
              {...(nom === "phone"
                ? { type: "tel", className: "font-mono" }
                : {})}
              {...(nom === "order" ? { inputMode: "numeric" as const } : {})}
              {...(nom === "country"
                ? { maxLength: 2, className: "uppercase" }
                : {})}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button variant={numero ? "outline" : "default"} size="sm">
          {numero ? t("edit") : t("add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{numero ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(enregistrer)}
            className="space-y-4"
            noValidate
          >
            {champTexte("label")}
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("category")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
                    >
                      {CATEGORIES_URGENCE.map((c) => (
                        <option key={c} value={c}>
                          {tCat(c)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              {champTexte("phone")}
              {champTexte("country")}
            </div>
            <div className="grid gap-4 sm:grid-cols-[1fr_6rem]">
              {champTexte("city")}
              {champTexte("order")}
            </div>
            {champTexte("notes")}
            <FormErrorBanner messages={bandeau} />
            <DialogFormFooter
              onCancel={() => changerOuverture(false)}
              enCours={enregistrement.isPending}
            >
              {t("save")}
            </DialogFormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
