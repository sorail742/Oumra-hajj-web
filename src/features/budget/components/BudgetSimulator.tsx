"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  POSTES,
  totalBudget,
  useEnregistrerBudget,
  type Poste,
} from "../api/use-budget";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { Money } from "@/components/shared/Money";
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

/**
 * Simulateur de budget total (backend #2) : prix du forfait choisi plus
 * les dépenses sur place, total recalculé à la saisie, simulation
 * enregistrée pour comparer. Forfaits fournis par la page (règle 2).
 */
export interface ForfaitOption {
  id: string;
  titre: string;
  prix: number;
}

const MONTANT = /^\d{0,12}$/;

export function BudgetSimulator({
  forfaits,
}: Readonly<{ forfaits: readonly ForfaitOption[] }>) {
  const t = useTranslations("budget.simulator");
  const enregistrer = useEnregistrerBudget();
  const [bandeau, setBandeau] = useState<string[]>([]);

  const schema = useMemo(() => {
    const montant = z
      .string()
      .trim()
      .refine((v) => MONTANT.test(v), t("amountInvalid"));
    return z.object({
      packageId: z.string(),
      pocketMoney: montant,
      gifts: montant,
      sacrifice: montant,
      insurance: montant,
      otherExpenses: montant,
    });
  }, [t]);
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageId: "",
      pocketMoney: "",
      gifts: "",
      sacrifice: "",
      insurance: "",
      otherExpenses: "",
    },
  });
  const saisie = useWatch({ control: form.control });

  const montants = (v: Partial<Valeurs>): Record<Poste, number> =>
    Object.fromEntries(
      POSTES.map((p) => [p, MONTANT.test(v[p] ?? "") ? Number(v[p] || 0) : 0]),
    ) as Record<Poste, number>;
  const prixForfait =
    forfaits.find((f) => f.id === saisie.packageId)?.prix ?? 0;
  const total = totalBudget({ ...montants(saisie), packagePrice: prixForfait });

  async function envoyer(v: Valeurs) {
    setBandeau([]);
    try {
      await enregistrer.mutateAsync({
        ...(v.packageId ? { packageId: v.packageId } : {}),
        ...montants(v),
      });
      toast.success(t("saved"));
    } catch {
      setBandeau([t("error")]);
    }
  }

  return (
    <section className="bg-card space-y-4 rounded-xl border p-5">
      <div className="space-y-1">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(envoyer)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="packageId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("package")}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
                  >
                    <option value="">{t("noPackage")}</option>
                    {forfaits.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.titre}
                      </option>
                    ))}
                  </select>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {POSTES.map((poste) => (
              <FormField
                key={poste}
                control={form.control}
                name={poste}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(`postes.${poste}`)}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        inputMode="numeric"
                        placeholder="0"
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </div>
          <output className="bg-muted flex items-center justify-between rounded-lg px-4 py-3">
            <span className="text-sm font-medium">{t("total")}</span>
            <span className="text-lg font-semibold">
              <Money montant={total} />
            </span>
          </output>
          <FormErrorBanner messages={bandeau} />
          <Button type="submit" disabled={enregistrer.isPending}>
            {t("save")}
          </Button>
        </form>
      </Form>
    </section>
  );
}
