"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { Textarea } from "@/components/ui/textarea";
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";
import {
  LONGUEUR_MIN_MOTIF_REFUS_AGENCE,
  useApproveAgency,
  useRejectAgency,
} from "../api/use-agencies";

/**
 * Décision de l'administrateur sur une agence (ticket #31) — deux modales
 * courtes (`docs/design-system.md` §5). Le motif de refus est obligatoire
 * et communiqué à l'agence.
 */

export function ApproveAgencyDialog({
  agencyId,
}: Readonly<{ agencyId: string }>) {
  const t = useTranslations("agencies.actions");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const approbation = useApproveAgency(agencyId);

  async function approuver() {
    try {
      await approbation.mutateAsync();
      toast.success(t("approveSuccess"));
      setOuvert(false);
    } catch {
      toast.error(t("approveError"));
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button>{t("approve")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("approveTitle")}</DialogTitle>
          <DialogDescription>{t("approveBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            disabled={approbation.isPending}
            onClick={() => {
              approuver().catch(() => undefined);
            }}
          >
            {t("approveConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function RejectAgencyDialog({
  agencyId,
}: Readonly<{ agencyId: string }>) {
  const t = useTranslations("agencies.actions");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const rejet = useRejectAgency(agencyId);

  const schema = useMemo(
    () =>
      z.object({
        reason: z
          .string()
          .trim()
          .min(
            LONGUEUR_MIN_MOTIF_REFUS_AGENCE,
            t("reasonTooShort", { min: LONGUEUR_MIN_MOTIF_REFUS_AGENCE }),
          ),
      }),
    [t],
  );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { reason: "" },
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      form.reset();
      setBandeau([]);
    }
  }

  async function soumettre({ reason }: z.infer<typeof schema>) {
    setBandeau([]);
    try {
      await rejet.mutateAsync(reason);
      toast.success(t("rejectSuccess"));
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["reason"],
          t("rejectError"),
        ),
      );
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          className="text-destructive hover:text-destructive"
        >
          {t("reject")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("rejectTitle")}</DialogTitle>
          <DialogDescription>{t("rejectBody")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(soumettre)}
            className="space-y-4"
            noValidate
          >
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("reasonLabel")}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder={t("reasonPlaceholder")}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            {bandeau.length > 0 && (
              <div
                role="alert"
                className="bg-state-danger-bg text-state-danger space-y-1 rounded-md px-3 py-2 text-sm"
              >
                {bandeau.map((message) => (
                  <p key={message}>{message}</p>
                ))}
              </div>
            )}
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => changerOuverture(false)}
              >
                {tc("cancel")}
              </Button>
              <Button
                type="submit"
                variant="destructive"
                disabled={rejet.isPending}
              >
                {rejet.isPending ? t("rejecting") : t("rejectConfirm")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
