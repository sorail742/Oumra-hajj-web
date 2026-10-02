"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreerGroupe } from "../api/use-groups";
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
import { appliquerErreurFormulaire } from "@/lib/api/form-errors";

/**
 * Création d'un groupe de voyage par l'agence (ticket #63) : un forfait
 * de l'agence et un nom. Les forfaits sont fournis par la page (règle 2 :
 * le domaine `groups` n'importe pas `packages`).
 */
export interface ForfaitOption {
  id: string;
  title: string;
}

export function CreateGroupDialog({
  forfaits,
}: Readonly<{ forfaits: readonly ForfaitOption[] }>) {
  const t = useTranslations("groups.create");
  const tc = useTranslations("common");
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const creation = useCreerGroupe();

  const schema = useMemo(
    () =>
      z.object({
        packageId: z.string().min(1, t("packageRequired")),
        title: z.string().trim().min(2, t("titleTooShort")),
      }),
    [t],
  );
  const form = useForm<z.infer<typeof schema>>({
    resolver: zodResolver(schema),
    defaultValues: { packageId: "", title: "" },
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      form.reset();
      setBandeau([]);
    }
  }

  async function creer(valeurs: z.infer<typeof schema>) {
    setBandeau([]);
    try {
      const groupe = await creation.mutateAsync(valeurs);
      toast.success(t("created"));
      changerOuverture(false);
      router.push(`/groups/${groupe.id}`);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["packageId", "title"],
          t("error"),
        ),
      );
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button disabled={forfaits.length === 0}>
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
            onSubmit={form.handleSubmit(creer)}
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
                      <option value="">{t("packagePlaceholder")}</option>
                      {forfaits.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.title}
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
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("name")}</FormLabel>
                  <FormControl>
                    <Input {...field} placeholder={t("namePlaceholder")} />
                  </FormControl>
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
