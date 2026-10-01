"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
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
import { ApiError } from "@/lib/api/types";
import { useInitiatePayment } from "../api/use-payments";
import type { Payment } from "../api/schemas";
import { cleErreurInitiation } from "../lib/initiate-error";
import { CLE_TRADUCTION_METHODE, MOYENS_PAIEMENT } from "../lib/payment-method";

/**
 * Saisie d'une tranche : montant entier en GNF (pas de sous-unité) et moyen
 * de paiement. Aucune valeur n'est journalisée (règle « données de
 * paiement », `docs/coding-rules-frontend.md`).
 */
export function PaymentForm({
  bookingId,
  onInitiated,
}: {
  bookingId: string;
  onInitiated: (paiement: Payment) => void;
}) {
  const t = useTranslations("payments");
  const initiation = useInitiatePayment();
  const [bandeau, setBandeau] = useState<string | null>(null);

  const schema = useMemo(
    () =>
      z.object({
        amount: z
          .string()
          .trim()
          .regex(/^\d+$/, t("initiate.amountInvalid"))
          .refine(
            (v) => Number(v) > 0 && Number.isSafeInteger(Number(v)),
            t("initiate.amountInvalid"),
          ),
        method: z.enum(MOYENS_PAIEMENT),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: { amount: "", method: "mobile_money_orange" },
  });

  async function soumettre(valeurs: Valeurs) {
    setBandeau(null);
    try {
      const paiement = await initiation.mutateAsync({
        bookingId,
        amount: Number(valeurs.amount),
        method: valeurs.method,
      });
      onInitiated(paiement);
    } catch (erreur) {
      if (erreur instanceof ApiError && erreur.statusCode === 400) {
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["amount", "method"],
          "",
        );
      }
      setBandeau(t(`initiate.${cleErreurInitiation(erreur)}`));
    }
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(soumettre)}
        className="space-y-4"
        noValidate
      >
        <FormField
          control={form.control}
          name="amount"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("initiate.amountLabel")}</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  inputMode="numeric"
                  autoComplete="off"
                  className="font-mono tabular-nums"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="method"
          render={({ field }) => (
            <FormItem>
              <FormLabel>{t("initiate.methodLabel")}</FormLabel>
              <div
                role="radiogroup"
                aria-label={t("initiate.methodLabel")}
                className="grid gap-2 sm:grid-cols-3"
              >
                {MOYENS_PAIEMENT.map((moyen) => (
                  <label
                    key={moyen}
                    className="flex min-h-11 cursor-pointer items-center gap-2 rounded-md border px-3 text-sm has-[:checked]:border-primary has-[:checked]:bg-muted"
                  >
                    <input
                      type="radio"
                      name={field.name}
                      value={moyen}
                      checked={field.value === moyen}
                      onChange={() => field.onChange(moyen)}
                      onBlur={field.onBlur}
                    />
                    {t(CLE_TRADUCTION_METHODE[moyen])}
                  </label>
                ))}
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
        {bandeau && (
          <p
            role="alert"
            className="rounded-md bg-state-danger-bg px-3 py-2 text-sm text-state-danger"
          >
            {bandeau}
          </p>
        )}
        <Button type="submit" disabled={initiation.isPending}>
          {initiation.isPending
            ? t("initiate.submitting")
            : t("initiate.submit")}
        </Button>
      </form>
    </Form>
  );
}
