"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreerDevis } from "../api/use-quotes";
import { QUOTE_CLIENT_TYPES } from "../api/schemas";
import {
  SANS_FORFAIT,
  schemaDevis,
  versNouveauDevis,
  type ValeursDevis,
} from "../lib/formulaire-devis";
import { QuoteLinesFields } from "./QuoteLinesFields";
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

export interface ForfaitDevis {
  id: string;
  title: string;
  price: number;
}

const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";

type ChampTexte =
  | "clientName"
  | "contactName"
  | "contactPhone"
  | "contactEmail"
  | "pilgrimsCount"
  | "discountPercent"
  | "validUntil";

/**
 * Nouveau devis (idée #49) : client, lignes, remise et validité. Choisir un
 * forfait pré-remplit la première ligne ; les totaux viennent du backend.
 * Les forfaits viennent de la page (règle 2).
 */
export function CreateQuoteDialog({
  forfaits,
}: Readonly<{ forfaits: readonly ForfaitDevis[] }>) {
  const t = useTranslations("quotes.create");
  const tt = useTranslations("quotes.clientTypes");
  const tc = useTranslations("common");
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const creation = useCreerDevis();

  const schema = useMemo(
    () =>
      schemaDevis({
        required: t("required"),
        integerInvalid: t("integerInvalid"),
        amountInvalid: t("amountInvalid"),
        discountInvalid: t("discountInvalid"),
        phoneInvalid: t("phoneInvalid"),
        emailInvalid: t("emailInvalid"),
        dateInvalid: t("dateInvalid"),
      }),
    [t],
  );
  const form = useForm<ValeursDevis>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageId: SANS_FORFAIT,
      clientName: "",
      clientType: "company",
      contactName: "",
      contactPhone: "",
      contactEmail: "",
      pilgrimsCount: "",
      lines: [{ label: "", quantity: "1", unitPrice: "" }],
      discountPercent: "",
      conditions: "",
      validUntil: "",
    },
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      form.reset();
      setBandeau([]);
    }
  }

  function choisirForfait(id: string) {
    form.setValue("packageId", id);
    const forfait = forfaits.find((f) => f.id === id);
    if (!forfait) return;
    form.setValue("lines.0.label", t("packageLine", { title: forfait.title }));
    form.setValue("lines.0.unitPrice", String(forfait.price));
    const nombre = form.getValues("pilgrimsCount");
    if (nombre) form.setValue("lines.0.quantity", nombre);
  }

  async function creer(v: ValeursDevis) {
    setBandeau([]);
    try {
      const devis = await creation.mutateAsync(versNouveauDevis(v));
      toast.success(t("created", { number: devis.number }));
      changerOuverture(false);
      router.push(`/quotes/${devis.id}`);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["clientName", "contactName", "pilgrimsCount", "validUntil"],
          t("error"),
        ),
      );
    }
  }

  const champ = (
    name: ChampTexte,
    options: {
      type?: string;
      mono?: boolean;
      inputMode?: "numeric" | "decimal" | "tel" | "email";
    } = {},
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
              type={options.type}
              inputMode={options.inputMode}
              className={options.mono ? "font-mono" : undefined}
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button>
          <Plus aria-hidden className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-h-[90svh] max-w-(--dialog-lg) overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(creer)}
            className="space-y-4"
            noValidate
          >
            <div className="grid gap-4 sm:grid-cols-2">
              {champ("clientName")}
              <FormField
                control={form.control}
                name="clientType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("clientType")}</FormLabel>
                    <FormControl>
                      <select {...field} className={SELECT}>
                        {QUOTE_CLIENT_TYPES.map((c) => (
                          <option key={c} value={c}>
                            {tt(c)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-3">
              {champ("contactName")}
              {champ("contactPhone", {
                type: "tel",
                inputMode: "tel",
                mono: true,
              })}
              {champ("contactEmail", { type: "email", inputMode: "email" })}
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="packageId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("package")}</FormLabel>
                    <FormControl>
                      <select
                        {...field}
                        onChange={(e) => choisirForfait(e.target.value)}
                        className={SELECT}
                      >
                        <option value={SANS_FORFAIT}>{t("noPackage")}</option>
                        {forfaits.map((f) => (
                          <option key={f.id} value={f.id}>
                            {f.title}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              {champ("pilgrimsCount", { inputMode: "numeric", mono: true })}
            </div>
            <QuoteLinesFields control={form.control} />
            <div className="grid gap-4 sm:grid-cols-2">
              {champ("discountPercent", { inputMode: "decimal", mono: true })}
              {champ("validUntil", { type: "date" })}
            </div>
            <FormField
              control={form.control}
              name="conditions"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("conditions")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={3} maxLength={2000} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {t("conditionsHint")}
                  </p>
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
              <Button type="submit" disabled={creation.isPending}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
