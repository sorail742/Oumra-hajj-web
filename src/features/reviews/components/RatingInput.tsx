"use client";

import { useId } from "react";
import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "cn";

/**
 * Note de 1 à 5 étoiles, saisie (ticket #59) — `RatingStars` reste en
 * lecture seule. Des boutons radio natifs dans un `<fieldset>` : flèches
 * du clavier, annonce « 3 étoiles sur 5 » par les lecteurs d'écran ; les
 * étoiles ne sont que l'habillage.
 */
const NOTES = [1, 2, 3, 4, 5] as const;

export function RatingInput({
  legend,
  value,
  onChange,
  invalid,
}: Readonly<{
  legend: string;
  value: number;
  onChange: (note: number) => void;
  invalid?: boolean;
}>) {
  const t = useTranslations("reviews.form");
  const nom = useId();

  return (
    <fieldset aria-invalid={invalid} className="space-y-2">
      <legend className="text-sm font-medium">{legend}</legend>
      <div className="flex items-center gap-1">
        {NOTES.map((note) => (
          <label
            key={note}
            className="cursor-pointer rounded-md p-1 has-focus-visible:ring-[3px] has-focus-visible:ring-ring/50"
          >
            <input
              type="radio"
              name={nom}
              value={note}
              checked={value === note}
              onChange={() => onChange(note)}
              className="sr-only"
            />
            <span className="sr-only">{t("stars", { count: note })}</span>
            <Star
              aria-hidden
              className={cn(
                "size-7 transition-colors duration-(--motion-fast)",
                note <= value
                  ? "fill-accent text-accent"
                  : "text-muted-foreground",
              )}
            />
          </label>
        ))}
      </div>
    </fieldset>
  );
}
