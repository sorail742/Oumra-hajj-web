"use client";

import { useMemo, useState } from "react";
import { useFieldArray, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { useProposerQuestion } from "../api/use-quiz";
import { FormErrorBanner } from "@/components/shared/FormErrorBanner";
import { ReligiousContentNotice } from "@/components/shared/ReligiousContentNotice";
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
import { Textarea } from "@/components/ui/textarea";

/**
 * Proposition d'une question de quiz par un guide ou un administrateur
 * (ticket #81). Contenu religieux : publié seulement après validation par
 * l'administrateur (règle 13). Les fiches viennent de la page (règle 2).
 */
const MIN_OPTIONS = 2;
const MAX_OPTIONS = 6;

export interface FicheOption {
  id: string;
  titre: string;
}

export function QuestionProposalForm({
  fiches,
}: Readonly<{ fiches: readonly FicheOption[] }>) {
  const t = useTranslations("quiz.propose");
  const proposer = useProposerQuestion();
  const [bandeau, setBandeau] = useState<string[]>([]);

  const schema = useMemo(
    () =>
      z
        .object({
          riteSheetId: z.string().min(1, t("sheetRequired")),
          question: z.string().trim().min(5, t("questionTooShort")),
          options: z
            .array(
              z.object({ texte: z.string().trim().min(1, t("optionEmpty")) }),
            )
            .min(MIN_OPTIONS)
            .max(MAX_OPTIONS),
          correctOption: z.number().int().min(0),
          explanation: z.string().trim(),
        })
        .refine((v) => v.correctOption < v.options.length, {
          path: ["correctOption"],
          message: t("correctRequired"),
        }),
    [t],
  );
  type Valeurs = z.infer<typeof schema>;
  const form = useForm<Valeurs>({
    resolver: zodResolver(schema),
    defaultValues: {
      riteSheetId: "",
      question: "",
      options: [{ texte: "" }, { texte: "" }],
      correctOption: 0,
      explanation: "",
    },
  });
  const options = useFieldArray({ control: form.control, name: "options" });
  const bonne = useWatch({ control: form.control, name: "correctOption" });

  async function envoyer(v: Valeurs) {
    setBandeau([]);
    try {
      await proposer.mutateAsync({
        riteSheetId: v.riteSheetId,
        question: v.question,
        options: v.options.map((o) => o.texte),
        correctOption: v.correctOption,
        ...(v.explanation ? { explanation: v.explanation } : {}),
      });
      toast.success(t("sent"));
      form.reset();
    } catch {
      setBandeau([t("error")]);
    }
  }

  return (
    <section className="bg-card space-y-4 rounded-xl border p-5">
      <div className="space-y-2">
        <h2 className="text-base font-semibold">{t("title")}</h2>
        <ReligiousContentNotice validated={false} />
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(envoyer)}
          className="space-y-4"
          noValidate
        >
          <FormField
            control={form.control}
            name="riteSheetId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("sheet")}</FormLabel>
                <FormControl>
                  <select
                    {...field}
                    className="border-input bg-background h-(--size-field) w-full rounded-md border px-3 text-sm"
                  >
                    <option value="" disabled>
                      {t("sheetPlaceholder")}
                    </option>
                    {fiches.map((f) => (
                      <option key={f.id} value={f.id}>
                        {f.titre}
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
            name="question"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("question")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <fieldset className="space-y-2">
            <legend className="mb-1 text-sm font-medium">{t("options")}</legend>
            <p className="text-muted-foreground text-xs">{t("optionsHint")}</p>
            {options.fields.map((champ, i) => (
              <FormField
                key={champ.id}
                control={form.control}
                name={`options.${i}.texte`}
                render={({ field }) => (
                  <FormItem>
                    <div className="flex items-center gap-2">
                      <input
                        type="radio"
                        name="bonne-reponse"
                        checked={bonne === i}
                        onChange={() => form.setValue("correctOption", i)}
                        aria-label={t("markCorrect", { n: i + 1 })}
                        className="accent-primary size-4"
                      />
                      <FormControl>
                        <Input
                          {...field}
                          aria-label={t("optionLabel", { n: i + 1 })}
                        />
                      </FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        disabled={options.fields.length <= MIN_OPTIONS}
                        onClick={() => {
                          options.remove(i);
                          if (bonne >= i && bonne > 0) {
                            form.setValue("correctOption", bonne - 1);
                          }
                        }}
                        aria-label={t("removeOption", { n: i + 1 })}
                      >
                        <Trash2 aria-hidden className="size-4" />
                      </Button>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={options.fields.length >= MAX_OPTIONS}
              onClick={() => options.append({ texte: "" })}
            >
              <Plus aria-hidden className="size-4" />
              {t("addOption")}
            </Button>
          </fieldset>
          <FormField
            control={form.control}
            name="explanation"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("explanation")}</FormLabel>
                <FormControl>
                  <Textarea {...field} rows={2} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormErrorBanner messages={bandeau} />
          <Button type="submit" disabled={proposer.isPending}>
            {t("submit")}
          </Button>
        </form>
      </Form>
    </section>
  );
}
