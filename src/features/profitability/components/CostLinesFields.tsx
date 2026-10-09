"use client";

import { useFieldArray, type Control } from "react-hook-form";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import type { ValeursRentabilite } from "../lib/formulaire-rentabilite";
import { Button } from "@/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";

/** Lignes de coûts (par pèlerin ou fixes) — liste dynamique, 30 au plus. */
export function CostLinesFields({
  control,
  name,
  legende,
}: Readonly<{
  control: Control<ValeursRentabilite>;
  name: "costsPerPilgrim" | "fixedCosts";
  legende: string;
}>) {
  const t = useTranslations("profitability.form");
  const { fields, append, remove } = useFieldArray({ control, name });

  return (
    <fieldset className="space-y-3 rounded-lg border p-4">
      <legend className="px-1 font-medium">{legende}</legend>
      {fields.map((champ, index) => (
        <div key={champ.id} className="flex items-start gap-2">
          <FormField
            control={control}
            name={`${name}.${index}.label`}
            render={({ field }) => (
              <FormItem className="min-w-0 flex-1">
                <FormControl>
                  <Input
                    {...field}
                    maxLength={80}
                    aria-label={t("lineLabel", {
                      group: legende,
                      number: index + 1,
                    })}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name={`${name}.${index}.amount`}
            render={({ field }) => (
              <FormItem className="w-36 shrink-0">
                <FormControl>
                  <Input
                    {...field}
                    inputMode="decimal"
                    className="font-mono"
                    aria-label={t("lineAmount", {
                      group: legende,
                      number: index + 1,
                    })}
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
            onClick={() => remove(index)}
            aria-label={t("removeLine", { group: legende, number: index + 1 })}
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
        onClick={() => append({ label: "", amount: "" })}
      >
        <Plus aria-hidden className="size-4" />
        {t("addLine")}
      </Button>
    </fieldset>
  );
}
