"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useOuvrirLitige } from "../api/use-disputes";
import { DISPUTE_CATEGORIES } from "../api/schemas";
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

/**
 * Ouverture d'un litige par le pèlerin (idée #62) sur l'une de ses
 * réservations — fournies par la page (règle 2). Rappelle de ne pas y
 * écrire de donnée de santé ni de numéro de document : le litige est lu
 * par l'agence, puis éventuellement par l'administration.
 */
const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";

export function CreateDisputeDialog({
  reservations,
}: Readonly<{ reservations: readonly { id: string; libelle: string }[] }>) {
  const t = useTranslations("disputes.create");
  const tc = useTranslations("common");
  const tcat = useTranslations("disputes.categories");
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const ouverture = useOuvrirLitige();

  const schema = useMemo(
    () =>
      z.object({
        bookingId: z.string().min(1, t("bookingRequired")),
        category: z.enum(DISPUTE_CATEGORIES),
        subject: z
          .string()
          .trim()
          .min(5, t("subjectTooShort"))
          .max(140, t("subjectTooLong")),
        message: z
          .string()
          .trim()
          .min(10, t("messageTooShort"))
          .max(2000, t("messageTooLong")),
      }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      bookingId: "",
      category: "service",
      subject: "",
      message: "",
    },
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    // Une seule réservation : présélectionnée. Lu à l'ouverture, la liste
    // pouvant arriver après le premier rendu.
    const unique = reservations.length === 1 ? reservations[0] : undefined;
    if (valeur && unique && !form.getValues("bookingId")) {
      form.setValue("bookingId", unique.id);
    }
    if (!valeur) {
      form.reset();
      setBandeau([]);
    }
  }

  async function ouvrir(valeurs: Valeurs) {
    setBandeau([]);
    try {
      const litige = await ouverture.mutateAsync(valeurs);
      toast.success(t("created"));
      changerOuverture(false);
      router.push(`/disputes/${litige.id}`);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["bookingId", "subject", "message"],
          t("error"),
        ),
      );
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button disabled={reservations.length === 0}>
          <Plus aria-hidden className="size-4" />
          {t("action")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(ouvrir)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="bookingId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("booking")}</FormLabel>
                  <FormControl>
                    <select {...field} className={SELECT}>
                      <option value="">{t("bookingPlaceholder")}</option>
                      {reservations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.libelle}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("category")}</FormLabel>
                  <FormControl>
                    <select {...field} className={SELECT}>
                      {DISPUTE_CATEGORIES.map((c) => (
                        <option key={c} value={c}>
                          {tcat(c)}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="subject"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("subject")}</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={140} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="message"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("message")}</FormLabel>
                  <FormControl>
                    <Textarea {...field} rows={5} maxLength={2000} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {t("privacyHint")}
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
              <Button type="submit" disabled={ouverture.isPending}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
