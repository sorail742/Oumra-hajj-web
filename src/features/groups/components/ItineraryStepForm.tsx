"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAjouterEtape } from "../api/use-groups";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
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

/**
 * Ajout d'une étape à l'itinéraire d'un groupe par l'agence (ticket #65) :
 * libellé, date, lieu facultatif. Les pèlerins et le guide voient
 * l'itinéraire mis à jour.
 */
const CHAMPS = [
  { nom: "label", type: "text" },
  { nom: "date", type: "date" },
  { nom: "location", type: "text" },
] as const;

export function ItineraryStepForm({ groupId }: Readonly<{ groupId: string }>) {
  const t = useTranslations("groups.itinerary");
  const ajout = useAjouterEtape(groupId);
  const [bandeau, setBandeau] = useState<string[]>([]);

  const schema = useMemo(
    () =>
      z.object({
        label: z.string().trim().min(2, t("labelTooShort")),
        date: z.string().min(1, t("dateRequired")),
        location: z.string().trim(),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: { label: "", date: "", location: "" },
  });

  async function ajouter({ label, date, location }: Valeurs) {
    setBandeau([]);
    try {
      await ajout.mutateAsync({
        label,
        date,
        ...(location ? { location } : {}),
      });
      toast.success(t("added"));
      form.reset();
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["label", "date", "location"],
          t("error"),
        ),
      );
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(ajouter)}
        className="bg-muted/40 space-y-4 rounded-lg border border-dashed p-4"
        noValidate
      >
        <p className="text-sm font-medium">{t("formTitle")}</p>
        <div className="grid gap-4 sm:grid-cols-[2fr_1fr_1.5fr]">
          {CHAMPS.map(({ nom, type }) => (
            <FormField
              key={nom}
              control={form.control}
              name={nom}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t(nom)}</FormLabel>
                  <FormControl>
                    <Input {...field} type={type} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          ))}
        </div>
        <FormErrorBanner messages={bandeau} />
        <Button type="submit" size="sm" disabled={ajout.isPending}>
          {t("submit")}
        </Button>
      </form>
    </Form>
  );
}
