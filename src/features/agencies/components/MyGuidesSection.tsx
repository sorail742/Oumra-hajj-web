"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAjouterGuide, useMyGuides } from "../api/use-my-guides";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { StatusBadge } from "@/components/shared/StatusBadge";
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
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { ApiError } from "@/lib/api/types";
import { formatTelephone } from "@/lib/format";

/**
 * Guides de l'agence (ticket #64) : liste et ajout. Le guide se connecte
 * ensuite par code reçu par SMS ou par e-mail ; il pourra être assigné aux
 * groupes de l'agence.
 */
const FORMAT_E164 = /^\+\d{8,15}$/;

function AjouterGuide() {
  const t = useTranslations("myAgency.guides");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const ajout = useAjouterGuide();

  const schema = useMemo(
    () =>
      z
        .object({
          fullName: z.string().trim().min(2, t("nameTooShort")),
          phone: z
            .string()
            .trim()
            .refine((v) => v === "" || FORMAT_E164.test(v), t("phoneInvalid")),
          email: z
            .string()
            .trim()
            .refine(
              (v) => v === "" || z.email().safeParse(v).success,
              t("emailInvalid"),
            ),
        })
        .refine((v) => v.phone !== "" || v.email !== "", {
          path: ["phone"],
          message: t("contactRequired"),
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: { fullName: "", phone: "", email: "" },
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      form.reset();
      setBandeau([]);
    }
  }

  async function ajouter(v: Valeurs) {
    setBandeau([]);
    try {
      await ajout.mutateAsync({
        fullName: v.fullName,
        ...(v.phone ? { phone: v.phone } : {}),
        ...(v.email ? { email: v.email.toLowerCase() } : {}),
      });
      toast.success(t("added"));
      changerOuverture(false);
    } catch (erreur) {
      const pris = erreur instanceof ApiError && erreur.statusCode === 409;
      setBandeau([pris ? t("conflict") : t("error")]);
    }
  }

  const champs = [
    { nom: "fullName", type: "text", aide: undefined },
    { nom: "phone", type: "tel", aide: t("phoneHint") },
    { nom: "email", type: "email", aide: undefined },
  ] as const;

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button size="sm">{t("add")}</Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("addTitle")}</DialogTitle>
          <DialogDescription>{t("addBody")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(ajouter)}
            className="space-y-4"
            noValidate
          >
            {champs.map(({ nom, type, aide }) => (
              <FormField
                key={nom}
                control={form.control}
                name={nom}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t(nom)}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type={type}
                        className={nom === "phone" ? "font-mono" : undefined}
                      />
                    </FormControl>
                    {aide && <FormDescription>{aide}</FormDescription>}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <FormErrorBanner messages={bandeau} />
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => changerOuverture(false)}
              >
                {tc("cancel")}
              </Button>
              <Button type="submit" disabled={ajout.isPending}>
                {t("submit")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export function MyGuidesSection() {
  const t = useTranslations("myAgency.guides");
  const query = useMyGuides();

  return (
    <section className="bg-card space-y-4 rounded-xl border p-5">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          <h2 className="text-base font-semibold">{t("title")}</h2>
          <p className="text-muted-foreground text-sm">{t("description")}</p>
        </div>
        <AjouterGuide />
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-16 w-full" />}
        empty={<p className="text-muted-foreground text-sm">{t("empty")}</p>}
      >
        {(guides) => (
          <ul className="divide-y rounded-lg border">
            {guides.map((g) => (
              <li
                key={g.id}
                className="flex flex-wrap items-center justify-between gap-2 px-4 py-3"
              >
                <span className="space-y-0.5">
                  <span className="block text-sm font-medium">
                    {g.fullName}
                  </span>
                  <span className="text-muted-foreground block font-mono text-xs">
                    {g.email ?? (g.phone ? formatTelephone(g.phone) : "")}
                  </span>
                </span>
                <StatusBadge
                  kind="userAccount"
                  value={g.isActive ? "active" : "suspended"}
                />
              </li>
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </section>
  );
}
