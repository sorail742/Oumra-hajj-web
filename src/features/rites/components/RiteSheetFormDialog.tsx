"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import type { RiteSheet } from "../api/schemas";
import {
  useCreerFiche,
  useModifierFiche,
  type SaisieFiche,
} from "../api/use-rites-admin";
import { DialogFormFooter } from "@/components/shared/DialogFormFooter";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
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
import { Textarea } from "@/components/ui/textarea";

const TYPES = ["oumra", "hadj", "both"] as const;
const LANGUES = ["fr", "en", "ar"] as const;
const ORDRE = /^\d{1,4}$/;
const CLASSE_SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";

/**
 * Création ou modification d'une fiche de rite (administrateur). Une fiche
 * créée n'est pas publiée, une fiche modifiée perd sa validation : le
 * dialogue le rappelle avant l'envoi.
 */
export function RiteSheetFormDialog({
  fiche,
  trigger,
}: Readonly<{ fiche?: RiteSheet; trigger: ReactNode }>) {
  const t = useTranslations("rites.admin.form");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const creer = useCreerFiche();
  const modifier = useModifierFiche(fiche?.id ?? "");
  const envoi = fiche ? modifier : creer;

  const schema = useMemo(
    () =>
      z.object({
        key: z.string().trim().min(2, t("tooShort")),
        title: z.string().trim().min(2, t("tooShort")),
        pilgrimageType: z.enum(TYPES),
        order: z.string().trim().regex(ORDRE, t("orderInvalid")),
        language: z.enum(LANGUES),
        content: z.string().trim().min(10, t("contentTooShort")),
        audioRef: z.string().trim(),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const valeursInitiales: Valeurs = {
    key: fiche?.key ?? "",
    title: fiche?.title ?? "",
    pilgrimageType: fiche?.pilgrimageType ?? "oumra",
    order: String(fiche?.order ?? 0),
    language: LANGUES.find((l) => l === fiche?.language) ?? "fr",
    content: fiche?.content ?? "",
    audioRef: fiche?.audioRef ?? "",
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

  async function envoyer(v: Valeurs) {
    setBandeau([]);
    const saisie: SaisieFiche = {
      key: v.key,
      title: v.title,
      pilgrimageType: v.pilgrimageType,
      order: Number(v.order),
      language: v.language,
      content: v.content,
      ...(v.audioRef ? { audioRef: v.audioRef } : {}),
    };
    try {
      await envoi.mutateAsync(saisie);
      toast.success(fiche ? t("updated") : t("created"));
      changerOuverture(false);
    } catch {
      setBandeau([t("error")]);
    }
  }

  const texte = (nom: "key" | "title" | "audioRef") => (
    <FormField
      control={form.control}
      name={nom}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(`fields.${nom}`)}</FormLabel>
          <FormControl>
            <Input {...field} />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{fiche ? t("editTitle") : t("createTitle")}</DialogTitle>
          <DialogDescription>
            {fiche ? t("editBody") : t("createBody")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(envoyer)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {texte("key")}
              {texte("title")}
              <FormField
                control={form.control}
                name="pilgrimageType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.pilgrimageType")}</FormLabel>
                    <FormControl>
                      <select {...field} className={CLASSE_SELECT}>
                        {TYPES.map((v) => (
                          <option key={v} value={v}>
                            {t(`types.${v}`)}
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
                name="language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.language")}</FormLabel>
                    <FormControl>
                      <select {...field} className={CLASSE_SELECT}>
                        {LANGUES.map((v) => (
                          <option key={v} value={v}>
                            {t(`languages.${v}`)}
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
                name="order"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("fields.order")}</FormLabel>
                    <FormControl>
                      <Input {...field} inputMode="numeric" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {texte("audioRef")}
            </div>
            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fields.content")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={8} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormErrorBanner messages={bandeau} />
            <DialogFormFooter
              onCancel={() => changerOuverture(false)}
              enCours={envoi.isPending}
            >
              {fiche ? t("saveEdit") : t("saveCreate")}
            </DialogFormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
