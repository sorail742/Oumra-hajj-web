"use client";

import { useMemo, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { useCreerBloc } from "../api/use-rooms";
import { ROOM_TYPES } from "../api/schemas";
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
 * Déclaration d'un bloc de chambres (idée #40) : forfait, hôtel — repris
 * d'une étape du forfait ou saisi —, type et nombre de chambres, date de
 * rétrocession. Les forfaits viennent de la page (règle 2).
 */
export interface ForfaitAvecEtapes {
  id: string;
  title: string;
  etapes: readonly { id: string; libelle: string }[];
}

const SELECT =
  "border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm";
const AUTRE_HOTEL = "";

export function CreateRoomBlockDialog({
  forfaits,
  forfaitInitial,
}: Readonly<{
  forfaits: readonly ForfaitAvecEtapes[];
  forfaitInitial?: string;
}>) {
  const t = useTranslations("rooms.create");
  const tc = useTranslations("common");
  const tt = useTranslations("rooms.types");
  const [ouvert, setOuvert] = useState(false);
  const [bandeau, setBandeau] = useState<string[]>([]);
  const creation = useCreerBloc();

  const schema = useMemo(
    () =>
      z
        .object({
          packageId: z.string().min(1, t("packageRequired")),
          stageId: z.string(),
          hotelName: z.string().trim(),
          city: z.string().trim(),
          roomType: z.enum(ROOM_TYPES),
          roomCount: z
            .string()
            .trim()
            .refine(
              (v) => /^\d+$/.test(v) && Number(v) >= 1 && Number(v) <= 500,
              t("roomCountInvalid"),
            ),
          releaseDate: z.string(),
          notes: z.string().trim().max(500),
        })
        .refine((v) => v.stageId !== AUTRE_HOTEL || v.hotelName.length >= 2, {
          path: ["hotelName"],
          message: t("hotelRequired"),
        })
        .refine((v) => v.stageId !== AUTRE_HOTEL || v.city.length >= 2, {
          path: ["city"],
          message: t("cityRequired"),
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;

  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      packageId: forfaitInitial ?? "",
      stageId: AUTRE_HOTEL,
      hotelName: "",
      city: "",
      roomType: "quadruple",
      roomCount: "10",
      releaseDate: "",
      notes: "",
    },
  });
  const forfaitId = useWatch({ control: form.control, name: "packageId" });
  const etapeId = useWatch({ control: form.control, name: "stageId" });
  const forfaitChoisi = forfaits.find((f) => f.id === forfaitId);
  const autreHotel = etapeId === AUTRE_HOTEL;

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
        packageId: v.packageId,
        roomType: v.roomType,
        roomCount: Number(v.roomCount),
        ...(v.stageId
          ? { stageId: v.stageId }
          : { hotelName: v.hotelName, city: v.city }),
        ...(v.releaseDate && { releaseDate: v.releaseDate }),
        ...(v.notes && { notes: v.notes }),
      });
      toast.success(t("created"));
      changerOuverture(false);
    } catch (erreur) {
      setBandeau(
        appliquerErreurFormulaire(
          erreur,
          form.setError,
          ["packageId", "hotelName", "city", "roomCount", "releaseDate"],
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
                      onChange={(e) => {
                        field.onChange(e);
                        form.setValue("stageId", AUTRE_HOTEL);
                      }}
                      className={SELECT}
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
              name="stageId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("hotel")}</FormLabel>
                  <FormControl>
                    <select {...field} className={SELECT}>
                      {forfaitChoisi?.etapes.map((e) => (
                        <option key={e.id} value={e.id}>
                          {e.libelle}
                        </option>
                      ))}
                      <option value={AUTRE_HOTEL}>{t("otherHotel")}</option>
                    </select>
                  </FormControl>
                </FormItem>
              )}
            />
            {autreHotel && (
              <div className="grid gap-4 sm:grid-cols-2">
                <FormField
                  control={form.control}
                  name="hotelName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("hotelName")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="city"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t("city")}</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <FormField
                control={form.control}
                name="roomType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("roomType")}</FormLabel>
                    <FormControl>
                      <select {...field} className={SELECT}>
                        {ROOM_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {tt(type)}
                          </option>
                        ))}
                      </select>
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="roomCount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("roomCount")}</FormLabel>
                    <FormControl>
                      <Input
                        {...field}
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={500}
                        className="font-mono"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <FormField
              control={form.control}
              name="releaseDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("releaseDate")}</FormLabel>
                  <FormControl>
                    <Input {...field} type="date" className="w-44" />
                  </FormControl>
                  <p className="text-muted-foreground text-xs">
                    {t("releaseDateHint")}
                  </p>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("notes")}</FormLabel>
                  <FormControl>
                    <Input {...field} maxLength={500} />
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
