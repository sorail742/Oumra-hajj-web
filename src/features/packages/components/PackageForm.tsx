"use client";

import { useMemo, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Loader2 } from "lucide-react";
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
import { ApiError } from "@/lib/api/types";
import { useCreerForfait, useModifierForfait } from "../api/use-my-packages";
import type { Package } from "../api/schemas";
import {
  schemaFormulaireForfait,
  valeursInitiales,
  versCorps,
  type ValeursForfait,
} from "../lib/formulaire-forfait";
import { StagesFields } from "./StagesFields";

/**
 * Création ou modification d'un forfait (ticket #33). Les dates d'étape
 * et du séjour sont vérifiées côté client ; le backend reste la barrière
 * (agence validée, propriété du forfait — règle 12).
 */

function Bloc({
  titre,
  aide,
  children,
}: Readonly<{ titre: string; aide?: string; children: ReactNode }>) {
  return (
    <section className="bg-card space-y-5 rounded-xl border p-6 shadow-(--shadow-raised)">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{titre}</h2>
        {aide && <p className="text-muted-foreground text-sm">{aide}</p>}
      </div>
      {children}
    </section>
  );
}

export function PackageForm({ forfait }: Readonly<{ forfait?: Package }>) {
  const t = useTranslations("packages.manage");
  const tForfaits = useTranslations("packages");
  const router = useRouter();
  const creation = useCreerForfait();
  const modification = useModifierForfait(forfait?.id ?? "");
  const mutation = forfait ? modification : creation;
  const [erreur, setErreur] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      schemaFormulaireForfait({
        titleTooShort: t("form.titleTooShort"),
        required: t("form.required"),
        priceInvalid: t("form.priceInvalid"),
        capacityInvalid: t("form.capacityInvalid"),
        endBeforeStart: t("form.endBeforeStart"),
        stagesRequired: t("form.stagesRequired"),
      }),
    [t],
  );
  const form = useForm<ValeursForfait>({
    resolver: zodResolver(schema),
    defaultValues: valeursInitiales(forfait),
  });

  async function enregistrer(valeurs: ValeursForfait) {
    setErreur(null);
    try {
      await mutation.mutateAsync(versCorps(valeurs));
      router.push("/my-packages?enregistre=1");
    } catch (cause) {
      const nonValidee = cause instanceof ApiError && cause.statusCode === 409;
      setErreur(t(nonValidee ? "notApproved" : "form.error"));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(enregistrer)}
        noValidate
        className="max-w-3xl space-y-6 pb-24 sm:pb-0"
      >
        <Bloc titre={t("form.general")}>
          <div className="grid gap-4 sm:grid-cols-[12rem_1fr]">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.type")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
                    >
                      <option value="oumra">{tForfaits("typeOumra")}</option>
                      <option value="hadj">{tForfaits("typeHadj")}</option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.title")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      placeholder={t("form.titlePlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("form.description")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={4} />
                </FormControl>
              </FormItem>
            )}
          />
        </Bloc>

        <Bloc titre={t("form.dates")}>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {(["startDate", "endDate"] as const).map((nom) => (
              <FormField
                key={nom}
                control={form.control}
                name={nom}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`form.${nom}`)}</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            {(["price", "capacity"] as const).map((nom) => (
              <FormField
                key={nom}
                control={form.control}
                name={nom}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`form.${nom}`)}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
        </Bloc>

        <Bloc titre={t("form.stages")} aide={t("form.stagesHint")}>
          <StagesFields control={form.control} />
          {form.formState.errors.stages?.root?.message && (
            <p className="text-destructive text-sm">
              {form.formState.errors.stages.root.message}
            </p>
          )}
        </Bloc>

        <Bloc titre={t("form.inclusions")}>
          <FormField
            control={form.control}
            name="inclusions"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Textarea
                    {...field}
                    rows={5}
                    aria-label={t("form.inclusions")}
                  />
                </FormControl>
                <FormDescription>{t("form.inclusionsHint")}</FormDescription>
              </FormItem>
            )}
          />
        </Bloc>

        <div className="bg-background/95 fixed inset-x-0 bottom-0 z-10 flex flex-wrap items-center gap-4 border-t p-4 backdrop-blur sm:static sm:border-0 sm:bg-transparent sm:p-0">
          <Button
            type="submit"
            disabled={mutation.isPending}
            className="bg-primary hover:bg-primary-hover h-(--size-touch) px-6"
          >
            {mutation.isPending && (
              <Loader2 aria-hidden className="size-4 animate-spin" />
            )}
            {t("form.save")}
          </Button>
          {erreur && (
            <p role="alert" className="text-state-danger text-sm font-medium">
              {erreur}
            </p>
          )}
        </div>
      </form>
    </Form>
  );
}
