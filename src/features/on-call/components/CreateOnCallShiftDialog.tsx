"use client";

import { useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreerCreneau } from "../api/use-on-call";
import { ON_CALL_ROLES } from "../api/schemas";
import { heureLocaleVersIso } from "../lib/heure-locale";
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

const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";
const FORMAT_E164 = /^\+\d{8,15}$/;
const TOUS_LES_VOYAGES = "";
const QUATORZE_JOURS_MS = 14 * 24 * 60 * 60 * 1000;

/**
 * Nouveau créneau d'astreinte (idée #63) : qui, quel numéro, quand, pour un
 * voyage ou pour tous. Heures lues dans le fuseau du produit. Les forfaits
 * viennent de la page (règle 2).
 */
export function CreateOnCallShiftDialog({
  forfaits,
  forfaitInitial,
}: Readonly<{
  forfaits: readonly { id: string; title: string }[];
  forfaitInitial?: string;
}>) {
  const t = useTranslations("onCall.create");
  const tc = useTranslations("common");
  const tr = useTranslations("onCall.roles");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const creation = useCreerCreneau();

  const schema = useMemo(
    () =>
      z
        .object({
          packageId: z.string(),
          staffName: z.string().trim().min(2, t("nameRequired")).max(120),
          staffRole: z.enum(ON_CALL_ROLES),
          phone: z
            .string()
            .trim()
            .refine((v) => FORMAT_E164.test(v), t("phoneInvalid")),
          startsAt: z
            .string()
            .refine(
              (v) => heureLocaleVersIso(v) !== undefined,
              t("dateRequired"),
            ),
          endsAt: z
            .string()
            .refine(
              (v) => heureLocaleVersIso(v) !== undefined,
              t("dateRequired"),
            ),
          notes: z.string().trim().max(300),
        })
        .superRefine((v, ctx) => {
          const debut = heureLocaleVersIso(v.startsAt);
          const fin = heureLocaleVersIso(v.endsAt);
          if (!debut || !fin) return;
          const duree = Date.parse(fin) - Date.parse(debut);
          if (duree <= 0) {
            ctx.addIssue({
              code: "custom",
              path: ["endsAt"],
              message: t("endBeforeStart"),
            });
          } else if (duree > QUATORZE_JOURS_MS) {
            ctx.addIssue({
              code: "custom",
              path: ["endsAt"],
              message: t("tooLong"),
            });
          }
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;

  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageId: forfaitInitial ?? TOUS_LES_VOYAGES,
      staffName: "",
      staffRole: "guide",
      phone: "",
      startsAt: "",
      endsAt: "",
      notes: "",
    },
  });

  function changerOuverture(valeur: boolean) {
    setOuvert(valeur);
    if (!valeur) {
      form.reset();
      setBandeau([]);
    }
  }

  async function creer(v: Valeurs) {
    setBandeau([]);
    try {
      await creation.mutateAsync({
        ...(v.packageId && { packageId: v.packageId }),
        staffName: v.staffName,
        staffRole: v.staffRole,
        phone: v.phone,
        startsAt: heureLocaleVersIso(v.startsAt) ?? v.startsAt,
        endsAt: heureLocaleVersIso(v.endsAt) ?? v.endsAt,
        ...(v.notes && { notes: v.notes }),
      });
      toast.success(t("created"));
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["packageId", "staffName", "phone", "startsAt", "endsAt", "notes"],
          t("error"),
        ),
      );
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={changerOuverture}>
      <DialogTrigger asChild>
        <Button>
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
                    <select {...field} className={SELECT}>
                      <option value={TOUS_LES_VOYAGES}>{t("allTrips")}</option>
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
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="staffName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("staffName")}</FormLabel>
                    <FormControl>
                      <Input {...field} autoComplete="off" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="staffRole"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("staffRole")}</FormLabel>
                    <FormControl>
                      <select {...field} className={SELECT}>
                        {ON_CALL_ROLES.map((r) => (
                          <option key={r} value={r}>
                            {tr(r)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("phone")}</FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type="tel"
                      inputMode="tel"
                      placeholder="+224…"
                      className="font-mono"
                    />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {t("phoneHint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="startsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("startsAt")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="endsAt"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("endsAt")}</FormLabel>
                    <FormControl>
                      <Input {...field} type="datetime-local" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <p className="text-muted-foreground text-xs">{t("timezoneHint")}</p>
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notes")}</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={300} />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {t("notesHint")}
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
