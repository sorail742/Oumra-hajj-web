"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  FREQUENCES,
  useReglerPlanEpargne,
  type PlanEpargne,
} from "../api/use-savings-plan";
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

const MONTANT = /^\d{1,12}$/;

/**
 * Réglage des cotisations automatiques : montant et fréquence ne sont
 * exigés que si les cotisations sont activées — même règle que le backend
 * (400 sinon), vérifiée ici pour un message immédiat.
 */
export function SavingsPlanForm({
  bookingId,
  plan,
}: Readonly<{ bookingId: string; plan: PlanEpargne | null }>) {
  const t = useTranslations("payments.savings.form");
  const regler = useReglerPlanEpargne(bookingId);
  const [bandeau, setBandeau] = useState<string[]>([]);

  const schema = useMemo(
    () =>
      z
        .object({
          autoDeduct: z.boolean(),
          deductAmount: z.string().trim(),
          frequency: z.enum(["", ...FREQUENCES]),
        })
        .superRefine((v, ctx) => {
          if (!v.autoDeduct) return;
          if (!MONTANT.test(v.deductAmount) || Number(v.deductAmount) < 1) {
            ctx.addIssue({
              code: "custom",
              path: ["deductAmount"],
              message: t("amountInvalid"),
            });
          }
          if (v.frequency === "") {
            ctx.addIssue({
              code: "custom",
              path: ["frequency"],
              message: t("frequencyRequired"),
            });
          }
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      autoDeduct: plan?.autoDeduct ?? false,
      deductAmount: plan?.deductAmount ? String(plan.deductAmount) : "",
      frequency: plan?.frequency ?? "",
    },
  });
  const actif = useWatch({ control: form.control, name: "autoDeduct" });

  async function envoyer(v: Valeurs) {
    setBandeau([]);
    try {
      await regler.mutateAsync({
        autoDeduct: v.autoDeduct,
        ...(v.deductAmount ? { deductAmount: Number(v.deductAmount) } : {}),
        ...(v.frequency ? { frequency: v.frequency } : {}),
      });
      toast.success(t("saved"));
    } catch {
      setBandeau([t("error")]);
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(envoyer)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="autoDeduct"
          render={({ field }) => (
            <FormItem className="flex items-center gap-3 space-y-0">
              <FormControl>
                <input
                  type="checkbox"
                  checked={field.value}
                  onChange={(e) => field.onChange(e.target.checked)}
                  onBlur={field.onBlur}
                  name={field.name}
                  ref={field.ref}
                  className="accent-primary size-4 shrink-0"
                />
              </FormControl>
              <FormLabel className="font-normal">{t("autoDeduct")}</FormLabel>
            </FormItem>
          )}
        />
        {actif && (
          <div className="grid gap-4 sm:grid-cols-2">
            <FormField
              control={form.control}
              name="deductAmount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("amount")}</FormLabel>
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
            <FormField
              control={form.control}
              name="frequency"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("frequency")}</FormLabel>
                  <FormControl>
                    <select
                      {...field}
                      className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
                    >
                      <option value="">{t("chooseFrequency")}</option>
                      {FREQUENCES.map((f) => (
                        <option key={f} value={f}>
                          {t(`frequencies.${f}`)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        )}
        <FormErrorBanner messages={bandeau} />
        <Button type="submit" disabled={regler.isPending}>
          {t("save")}
        </Button>
      </form>
    </Form>
  );
}
