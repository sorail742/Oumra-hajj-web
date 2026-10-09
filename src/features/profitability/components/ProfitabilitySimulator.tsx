"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { useSimulerRentabilite } from "../api/use-profitability";
import {
  NOUVELLE_OFFRE,
  schemaRentabilite,
  versHypotheses,
  type ValeursRentabilite,
} from "../lib/formulaire-rentabilite";
import { CostLinesFields } from "./CostLinesFields";
import { ProfitabilityResult } from "./ProfitabilityResult";
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

export interface ForfaitSimulable {
  id: string;
  title: string;
  price: number;
  capacity: number;
}

const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";

/**
 * Simulateur de rentabilité (idée #48) : pour une offre à publier ou un
 * forfait existant, coûts par pèlerin et fixes face au prix et à la
 * commission de la plateforme. Le calcul est fait par le backend ; les
 * forfaits viennent de la page (règle 2).
 */
export function ProfitabilitySimulator({
  forfaits,
}: Readonly<{ forfaits: readonly ForfaitSimulable[] }>) {
  const t = useTranslations("profitability.form");
  const [bandeau, setBandeau] = useState<string[]>([]);
  const simulation = useSimulerRentabilite();

  const schema = useMemo(
    () =>
      schemaRentabilite({
        amountInvalid: t("amountInvalid"),
        labelRequired: t("labelRequired"),
        integerInvalid: t("integerInvalid"),
        priceRequired: t("priceRequired"),
        capacityRequired: t("capacityRequired"),
        expectedTooHigh: t("expectedTooHigh"),
      }),
    [t],
  );

  const form = useForm<ValeursRentabilite>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageId: NOUVELLE_OFFRE,
      price: "",
      capacity: "",
      expectedPilgrims: "",
      costsPerPilgrim: [
        { label: t("defaults.flight"), amount: "" },
        { label: t("defaults.accommodation"), amount: "" },
        { label: t("defaults.visa"), amount: "" },
      ],
      fixedCosts: [{ label: t("defaults.supervision"), amount: "" }],
    },
  });
  const forfaitId = useWatch({ control: form.control, name: "packageId" });
  const forfait = forfaits.find((f) => f.id === forfaitId);

  async function simuler(v: ValeursRentabilite) {
    setBandeau([]);
    try {
      await simulation.mutateAsync(versHypotheses(v));
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["packageId", "price", "capacity", "expectedPilgrims"],
          t("error"),
        ),
      );
    }
  }

  const champNombre = (
    name: "price" | "capacity" | "expectedPilgrims",
    placeholder?: number,
  ) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{t(name)}</FormLabel>
          <FormControl>
            <Input
              {...field}
              inputMode={name === "price" ? "decimal" : "numeric"}
              placeholder={
                placeholder === undefined ? undefined : String(placeholder)
              }
              className="font-mono"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <div className="space-y-8">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(simuler)}
          className="max-w-(--content-form) space-y-5"
          noValidate
        >
          <FormField
            control={form.control}
            name="packageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("package")}</FormLabel>
                <FormControl>
                  <select {...field} className={SELECT}>
                    <option value={NOUVELLE_OFFRE}>{t("newOffer")}</option>
                    {forfaits.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.title}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <p className="text-muted-foreground text-xs">
                  {forfait ? t("packageHint") : t("newOfferHint")}
                </p>
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {champNombre("price", forfait?.price)}
            {champNombre("capacity", forfait?.capacity)}
            {champNombre("expectedPilgrims")}
          </div>
          <CostLinesFields
            control={form.control}
            name="costsPerPilgrim"
            legende={t("costsPerPilgrim")}
          />
          <CostLinesFields
            control={form.control}
            name="fixedCosts"
            legende={t("fixedCosts")}
          />
          <FormErrorBanner messages={bandeau} />
          <Button type="submit" disabled={simulation.isPending}>
            {t("submit")}
          </Button>
        </form>
      </Form>
      {simulation.data && <ProfitabilityResult resultat={simulation.data} />}
    </div>
  );
}
