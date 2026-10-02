"use client";

import { useId, useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useAssignerGuide } from "../api/use-groups";
import { Button } from "@/components/ui/button";

/**
 * Assignation d'un guide au groupe par l'agence (ticket #64). Les guides
 * proposés sont ceux de l'agence, fournis par la page (règle 2) ; le
 * backend refuse de toute façon un guide d'une autre agence.
 */
export interface GuideOption {
  id: string;
  label: string;
}

export function AssignGuideSelect({
  groupId,
  guideId,
  guides,
}: Readonly<{
  groupId: string;
  guideId?: string;
  guides: readonly GuideOption[];
}>) {
  const t = useTranslations("groups.assignGuide");
  const id = useId();
  const [choix, setChoix] = useState(guideId ?? "");
  const assignation = useAssignerGuide(groupId);

  if (guides.length === 0) {
    return <p className="text-muted-foreground text-sm">{t("noGuide")}</p>;
  }

  return (
    <form
      className="flex flex-wrap items-end gap-2"
      onSubmit={(evenement) => {
        evenement.preventDefault();
        assignation
          .mutateAsync(choix)
          .then(() => toast.success(t("assigned")))
          .catch(() => toast.error(t("error")));
      }}
    >
      <div className="space-y-1">
        <label htmlFor={id} className="block text-sm font-medium">
          {t("label")}
        </label>
        <select
          id={id}
          value={choix}
          onChange={(e) => setChoix(e.target.value)}
          className="border-input bg-background h-(--size-field) min-w-56 rounded-md border px-3 text-sm"
        >
          <option value="" disabled>
            {t("placeholder")}
          </option>
          {guides.map((g) => (
            <option key={g.id} value={g.id}>
              {g.label}
            </option>
          ))}
        </select>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!choix || choix === guideId || assignation.isPending}
      >
        {t("submit")}
      </Button>
    </form>
  );
}
