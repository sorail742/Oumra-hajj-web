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
import { useRejectDocument } from "../api/use-documents";
import { LONGUEUR_MIN_MOTIF_REFUS } from "../api/schemas";

/**
 * Refus d'un document avec motif obligatoire (ticket #38) — modale `md`
 * (`docs/design-system.md` §5 : décision courte, un champ). Le motif est
 * ensuite affiché au pèlerin dans sa liste de documents.
 */
export function RejectDocumentDialog({
  documentId,
  disabled,
}: {
  documentId: string;
  disabled?: boolean;
}) {
  const t = useTranslations("documents.review");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const rejet = useRejectDocument();

  const schema = useMemo(
    () =>
      z.object({
        reason: z
          .string()
          .trim()
          .min(
            LONGUEUR_MIN_MOTIF_REFUS,
            t("reasonTooShort", { min: LONGUEUR_MIN_MOTIF_REFUS }),
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
      await rejet.mutateAsync({ documentId, reason });
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
          size="sm"
          className="text-destructive hover:text-destructive"
          disabled={disabled}
        >
          {t("reject")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("rejectDialogTitle")}</DialogTitle>
          <DialogDescription>{t("rejectDialogDescription")}</DialogDescription>
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
                className="space-y-1 rounded-md bg-state-danger-bg px-3 py-2 text-sm text-state-danger"
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
