"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { ValeursDevis } from "../lib/formulaire-devis";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/** Lignes d'un devis (libellé, quantité, prix unitaire), 30 au plus. */
export function QuoteLinesFields({
  control,
}: Readonly<{ control: Control<ValeursDevis> }>) {
  const t = useTranslations("quotes.create");
  const { fields, append, remove } = useFieldArray({ control, name: "lines" });

  return (
    <fieldset className="space-y-3 rounded-lg border p-4">
      <legend className="px-1 font-medium">{t("lines")}</legend>
      {fields.map((champ, index) => (
        <div
          key={champ.id}
          className="grid grid-cols-[5rem_1fr_auto] items-start gap-2 sm:grid-cols-[1fr_5rem_8rem_auto]"
        >
          <FormField
            control={control}
            name={`lines.${index}.label`}
            render={({ field }) => (
              <FormItem className="col-span-3 min-w-0 sm:col-span-1">
                <FormControl>
                  <Input
                    {...field}
                    maxLength={120}
                    aria-label={t("lineLabel", { number: index + 1 })}
                    placeholder={t("placeholderLabel")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`lines.${index}.quantity`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="numeric"
                    className="font-mono"
                    aria-label={t("lineQuantity", { number: index + 1 })}
                    placeholder={t("placeholderQuantity")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`lines.${index}.unitPrice`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input
                    {...field}
                    inputMode="decimal"
                    className="font-mono"
                    aria-label={t("lineUnitPrice", { number: index + 1 })}
                    placeholder={t("placeholderUnitPrice")}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            disabled={fields.length === 1}
            onClick={() => remove(index)}
            aria-label={t("removeLine", { number: index + 1 })}
            className="text-muted-foreground hover:bg-state-danger-bg hover:text-state-danger mt-1"
          >
            <Trash2 aria-hidden />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        disabled={fields.length >= 30}
        onClick={() => append({ label: "", quantity: "1", unitPrice: "" })}
      >
        <Plus aria-hidden className="size-4" />
        {t("addLine")}
      </Button>
      <p className="text-muted-foreground text-xs">{t("totalsHint")}</p>
    </fieldset>
  );
}
