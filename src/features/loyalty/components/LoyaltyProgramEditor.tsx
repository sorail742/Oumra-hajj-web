"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProgrammeFidelite, useRemplacerPaliers } from "../api/use-loyalty";
import { PALIERS_MAX, type LoyaltyProgram } from "../api/schemas";
import {
  schemaPaliers,
  versPaliers,
  versValeurs,
  type ValeursPaliers,
} from "../lib/formulaire-paliers";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
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
import { Skeleton } from "@/components/ui/skeleton";
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";

/** Paliers de fidélité de l'agence (idée #47), cinq au plus. */
export function LoyaltyProgramEditor() {
  const query = useProgrammeFidelite();
  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-64 w-full" />}
      isEmpty={() => false}
    >
      {(programme) => <Editeur programme={programme} />}
    </AsyncBoundary>
  );
}

function Editeur({ programme }: Readonly<{ programme: LoyaltyProgram }>) {
  const t = useTranslations("loyalty.program");
  const [bandeau, setBandeau] = useState<string[]>([]);
  const enregistrement = useRemplacerPaliers();
  const schema = useMemo(
    () =>
      schemaPaliers({
        tripsInvalid: t("tripsInvalid"),
        labelInvalid: t("labelInvalid"),
        benefitInvalid: t("benefitInvalid"),
        duplicate: t("duplicate"),
      }),
    [t],
  );
  const form = useForm<ValeursPaliers>({
    resolver: zodResolver(schema),
    defaultValues: versValeurs(programme.tiers),
  });
  const { fields, append, remove } = useFieldArray({
    control: form.control,
    name: "tiers",
  });

  async function enregistrer(v: ValeursPaliers) {
    setBandeau([]);
    try {
      const resultat = await enregistrement.mutateAsync(versPaliers(v));
      form.reset(versValeurs(resultat.tiers));
      toast.success(t("saved"));
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(erreur, form.setError, [], t("error")),
      );
    }
  }

  return (
    <section className="bg-card space-y-4 rounded-lg border p-5 shadow-(--shadow-card)">
      <div>
        <h2 className="font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("hint")}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(enregistrer)}
          className="space-y-4"
          noValidate
        >
          {fields.length === 0 && (
            <p className="text-muted-foreground text-sm">{t("none")}</p>
          )}
          {fields.map((champ, index) => (
            <fieldset
              key={champ.id}
              className="grid gap-3 rounded-lg border p-4 sm:grid-cols-[8rem_1fr_2fr_auto]"
            >
              <legend className="sr-only">
                {t("tier", { number: index + 1 })}
              </legend>
              <FormField
                control={form.control}
                name={`tiers.${index}.minTrips`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("minTrips")}</FormLabel>
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
              <FormField
                control={form.control}
                name={`tiers.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("label")}</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={40} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`tiers.${index}.benefit`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("benefit")}</FormLabel>
                    <FormControl>
                      <Input {...field} maxLength={200} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label={t("remove", { number: index + 1 })}
                className="text-muted-foreground hover:bg-state-danger-bg hover:text-state-danger self-end"
              >
                <Trash2 aria-hidden />
              </Button>
            </fieldset>
          ))}
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={fields.length >= PALIERS_MAX}
              onClick={() =>
                append({
                  minTrips: String(fields.length + 1),
                  label: "",
                  benefit: "",
                })
              }
            >
              <Plus aria-hidden className="size-4" />
              {t("add")}
            </Button>
            <Button type="submit" disabled={enregistrement.isPending}>
              {t("save")}
            </Button>
          </div>
          <FormErrorBanner messages={bandeau} />
        </form>
      </Form>
    </section>
  );
}
