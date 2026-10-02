"use client";

import type { LucideIcon } from "lucide-react";
import { cn } from "cn";

/**
 * Choix exclusif court (filtre de statut, canal d'envoi…) : boutons à
 * `aria-pressed` dans un `<fieldset>` nommé par sa légende. L'état vit chez l'appelant — dans
 * l'URL pour un filtre (règle 8).
 */
export interface SegmentedOption<T extends string> {
  value: T;
  label: string;
  icon?: LucideIcon;
}

export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  className,
}: Readonly<{
  label: string;
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}>) {
  return (
    <fieldset
      className={cn(
        "bg-muted inline-flex flex-wrap gap-1 rounded-lg p-1",
        className,
      )}
    >
      <legend className="sr-only">{label}</legend>
      {options.map(({ value: option, label: libelle, icon: Icone }) => (
        <button
          key={option}
          type="button"
          aria-pressed={value === option}
          onClick={() => onChange(option)}
          className={cn(
            "inline-flex h-9 items-center justify-center gap-2 rounded-md px-3 text-sm font-medium transition-colors duration-(--motion-fast)",
            value === option
              ? "bg-card text-foreground shadow-(--shadow-raised)"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {Icone && <Icone aria-hidden className="size-4" />}
          {libelle}
        </button>
      ))}
    </fieldset>
  );
}
