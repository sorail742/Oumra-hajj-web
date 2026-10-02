"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ETAPE_VIDE, type ValeursForfait } from "../lib/formulaire-forfait";

/** Étapes du forfait (ville, hôtel, distance, dates) — liste dynamique. */
export function StagesFields({
  control,
}: Readonly<{ control: Control<ValeursForfait> }>) {
  const t = useTranslations("packages.manage.form");
  const { fields, append, remove } = useFieldArray({ control, name: "stages" });

  return (
    <div className="space-y-4">
      {fields.map((champ, index) => (
        <fieldset
          key={champ.id}
          className="bg-background space-y-4 rounded-lg border p-4"
        >
          <div className="flex items-center justify-between">
            <legend className="font-medium">
              {t("stage", { number: index + 1 })}
            </legend>
            {fields.length > 1 && (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                onClick={() => remove(index)}
                aria-label={t("removeStage", { number: index + 1 })}
                className="text-muted-foreground hover:bg-state-danger-bg hover:text-state-danger"
              >
                <Trash2 aria-hidden />
              </Button>
            )}
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={control}
              name={`stages.${index}.city`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("city")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`stages.${index}.hotelName`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hotel")}</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-3">
            <FormField
              control={control}
              name={`stages.${index}.distanceToMosqueMeters`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("distance")}</FormLabel>
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
              control={control}
              name={`stages.${index}.startDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stageStart")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={control}
              name={`stages.${index}.endDate`}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("stageEnd")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </fieldset>
      ))}
      <Button
        type="button"
        variant="secondary"
        onClick={() => append({ ...ETAPE_VIDE })}
      >
        <Plus aria-hidden />
        {t("addStage")}
      </Button>
    </div>
  );
}
