"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useEnregistrerCours } from "../api/use-micro-courses";
import { CATEGORIES_MICRO_COURS, type MicroCourse } from "../api/schemas";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
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
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";

/**
 * Création ou modification d'un micro-cours par l'administrateur (ticket
 * #83). Durée saisie en minutes et secondes, convertie en secondes pour
 * le backend ; l'URL de la vidéo doit être en https.
 */
const ENTIER = /^\d+$/;

export function MicroCourseFormDialog({
  cours,
}: Readonly<{ cours?: MicroCourse }>) {
  const t = useTranslations("microCourses.manage");
  const tCat = useTranslations("microCourses.category");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const enregistrement = useEnregistrerCours(cours?.id);

  const schema = useMemo(
    () =>
      z.object({
        title: z.string().trim().min(3, t("titleTooShort")),
        description: z.string().trim(),
        videoUrl: z.url({ protocol: /^https$/, error: t("urlInvalid") }),
        minutes: z.string().regex(ENTIER, t("numberInvalid")),
        secondes: z
          .string()
          .regex(ENTIER, t("numberInvalid"))
          .refine((v) => Number(v) < 60, t("secondsInvalid")),
        order: z.string().regex(ENTIER, t("numberInvalid")),
        category: z.enum(CATEGORIES_MICRO_COURS),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const valeursInitiales: Valeurs = {
    title: cours?.title ?? "",
    description: cours?.description ?? "",
    videoUrl: cours?.videoUrl ?? "",
    minutes: String(Math.floor((cours?.durationSeconds ?? 0) / 60)),
    secondes: String((cours?.durationSeconds ?? 0) % 60),
    order: String(cours?.order ?? 0),
    category:
      CATEGORIES_MICRO_COURS.find((c) => c === cours?.category) ??
      "preparation",
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
        title: v.title,
        videoUrl: v.videoUrl,
        durationSeconds: Number(v.minutes) * 60 + Number(v.secondes),
        order: Number(v.order),
        category: v.category,
        ...(v.description ? { description: v.description } : {}),
      });
      toast.success(cours ? t("updated") : t("created"));
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["title", "description", "videoUrl", "order", "category"],
          t("error"),
        ),
      );
    }
  }

  const champsCourts = [
    { nom: "minutes", libelle: t("minutes") },
    { nom: "secondes", libelle: t("seconds") },
    { nom: "order", libelle: t("order") },
  ] as const;

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button variant={cours ? "outline" : "default"} size="sm">
          {cours ? t("edit") : t("add")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{cours ? t("editTitle") : t("addTitle")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(enregistrer)}
            className="space-y-4"
            noValidate
          >
            {(["title", "videoUrl"] as const).map((nom) => (
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
                        type={nom === "videoUrl" ? "url" : "text"}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
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
                      {CATEGORIES_MICRO_COURS.map((c) => (
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
            <div className="grid grid-cols-3 gap-3">
              {champsCourts.map(({ nom, libelle }) => (
                <FormField
                  key={nom}
                  control={form.control}
                  name={nom}
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{libelle}</FormLabel>
                      <FormControl>
                        <Input {...field} inputMode="numeric" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ))}
            </div>
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("descriptionLabel")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormErrorBanner messages={bandeau} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => changerOuverture(false)}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={enregistrement.isPending}>
                {t("save")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
