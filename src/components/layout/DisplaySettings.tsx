"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { ALargeSmall, Contrast, Monitor, Moon, Sun } from "lucide-react";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { CONTRASTES, TAILLES_TEXTE } from "@/lib/affichage/preferences";
import { usePreferencesAffichage } from "@/lib/affichage/use-preferences-affichage";

/**
 * Réglages d'affichage de l'en-tête (issue backend #32) : taille du texte
 * et contraste élevé, pour un public souvent âgé, et le thème — seul accès
 * au thème sur mobile, où la bascule de l'en-tête est masquée faute de
 * place. Appliqués tout de suite à la page et retenus dans ce navigateur.
 * Fermé par Échap ou par un clic à l'extérieur, comme le menu du compte.
 */
const THEMES = [
  { value: "light", icon: Sun },
  { value: "dark", icon: Moon },
  { value: "system", icon: Monitor },
] as const;
type Theme = (typeof THEMES)[number]["value"];

function estTheme(valeur: string | undefined): valeur is Theme {
  return THEMES.some((theme) => theme.value === valeur);
}

export function DisplaySettings() {
  const t = useTranslations("nav.display");
  const { preferences, modifier } = usePreferencesAffichage();
  const { theme, setTheme } = useTheme();
  const [ouvert, setOuvert] = useState(false);
  const conteneur = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ouvert) return undefined;
    const surClic = (evenement: MouseEvent) => {
      if (!conteneur.current?.contains(evenement.target as Node))
        setOuvert(false);
    };
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setOuvert(false);
    };
    document.addEventListener("mousedown", surClic);
    document.addEventListener("keydown", surTouche);
    return () => {
      document.removeEventListener("mousedown", surClic);
      document.removeEventListener("keydown", surTouche);
    };
  }, [ouvert]);

  return (
    <div ref={conteneur} className="relative">
      <button
        type="button"
        onClick={() => setOuvert((o) => !o)}
        aria-expanded={ouvert}
        aria-haspopup="dialog"
        aria-label={t("open")}
        className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-10 items-center justify-center rounded-md border"
      >
        <ALargeSmall aria-hidden className="size-5" />
      </button>
      {ouvert && (
        <div
          role="dialog"
          aria-label={t("title")}
          className="bg-popover text-popover-foreground fixed inset-x-4 top-16 z-40 max-h-[calc(100svh-5rem)] space-y-4 overflow-y-auto rounded-lg border p-4 shadow-(--shadow-overlay) sm:absolute sm:inset-x-auto sm:top-auto sm:right-0 sm:mt-2 sm:w-80"
        >
          <div className="space-y-1">
            <p className="text-sm font-semibold">{t("title")}</p>
            <p className="text-muted-foreground text-xs">{t("hint")}</p>
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <ALargeSmall aria-hidden className="size-4" />
              {t("textSize")}
            </p>
            <SegmentedControl
              label={t("textSize")}
              className="flex w-full [&>button]:flex-1 [&>button]:whitespace-nowrap"
              options={TAILLES_TEXTE.map((value) => ({
                value,
                label: t(`sizes.${value}`),
              }))}
              value={preferences.texte}
              onChange={(texte) => modifier({ texte })}
            />
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Contrast aria-hidden className="size-4" />
              {t("contrast")}
            </p>
            <SegmentedControl
              label={t("contrast")}
              className="flex w-full [&>button]:flex-1 [&>button]:whitespace-nowrap"
              options={CONTRASTES.map((value) => ({
                value,
                label: t(`contrasts.${value}`),
              }))}
              value={preferences.contraste}
              onChange={(contraste) => modifier({ contraste })}
            />
          </div>
          <div className="space-y-2">
            <p className="flex items-center gap-2 text-sm font-medium">
              <Moon aria-hidden className="size-4" />
              {t("theme")}
            </p>
            <SegmentedControl
              label={t("theme")}
              className="flex w-full [&>button]:flex-1 [&>button]:whitespace-nowrap"
              options={THEMES.map(({ value, icon }) => ({
                value,
                icon,
                label: t(`themes.${value}`),
              }))}
              value={estTheme(theme) ? theme : "system"}
              onChange={setTheme}
            />
          </div>
        </div>
      )}
    </div>
  );
}
