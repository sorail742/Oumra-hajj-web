"use client";

import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { entreeCourante } from "@/config/navigation";

/**
 * Titre de section dans la barre supérieure (écrans larges) : l'entrée de
 * navigation de la page courante, avec son icône. Rien hors navigation
 * (profil, notifications) — le `PageHeader` de la page suffit.
 */
export function PageContext() {
  const t = useTranslations("nav");
  const entree = entreeCourante(usePathname());
  if (!entree) return null;
  const Icone = entree.icone;

  return (
    <p className="text-muted-foreground hidden items-center gap-2 text-sm lg:flex">
      <span className="bg-muted inline-flex size-8 items-center justify-center rounded-md border">
        <Icone aria-hidden className="text-foreground size-4" />
      </span>
      <span className="text-foreground font-medium">{t(entree.cle)}</span>
    </p>
  );
}
