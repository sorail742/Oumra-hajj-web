"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { DialogFormFooter } from "@/components/shared/DialogFormFooter";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

/**
 * Refus motivé (`docs/design-system.md` §5 : modale `md`, un champ) —
 * partagé par le refus d'un document pèlerin et celui d'une agence
 * (règle 2 : un `features/x` n'importe pas `features/y`). Le motif est
 * obligatoire ; `onSubmit` lève en cas d'échec, l'erreur s'affiche dans la
 * modale, qui ne se ferme qu'en cas de succès.
 */
export interface ReasonDialogLabels {
  trigger: string;
  title: string;
  description: string;
  reason: string;
  placeholder: string;
  tooShort: string;
  confirm: string;
  pending: string;
  error: string;
}

export function ReasonDialog({
  labels,
  minLength,
  isPending,
  onSubmit,
  disabled,
  size = "default",
}: Readonly<{
  labels: ReasonDialogLabels;
  minLength: number;
  isPending: boolean;
  onSubmit: (reason: string) => Promise<void>;
  disabled?: boolean;
  size?: "default" | "sm";
}>) {
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);

  const schema = useMemo(
    () =>
      z.object({ reason: z.string().trim().min(minLength, labels.tooShort) }),
    [minLength, labels.tooShort],
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
      await onSubmit(reason);
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["reason"],
          labels.error,
        ),
      );
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size={size}
          className="text-destructive hover:text-destructive"
          disabled={disabled}
        >
          {labels.trigger}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{labels.title}</DialogTitle>
          <DialogDescription>{labels.description}</DialogDescription>
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
                  <FormLabel>{labels.reason}</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      rows={4}
                      placeholder={labels.placeholder}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormErrorBanner messages={bandeau} />
            <DialogFormFooter
              onCancel={() => changerOuverture(false)}
              enCours={isPending}
              variant="destructive"
            >
              {isPending ? labels.pending : labels.confirm}
            </DialogFormFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
