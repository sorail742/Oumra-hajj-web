"use client";

import { useSyncExternalStore } from "react";
import { useTranslations } from "next-intl";
import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

/**
 * Bascule clair / sombre de l'en-tête. Par défaut le thème suit celui du
 * système (`providers.tsx`) ; un clic fixe le choix inverse, retenu par
 * `next-themes` dans ce navigateur. Le thème n'est connu qu'après
 * hydratation : avant, le bouton garde sa place sans icône (pas de saut).
 */
const abonner = () => () => undefined;

export function ThemeToggle() {
  const t = useTranslations("nav.theme");
  const { resolvedTheme, setTheme } = useTheme();
  const hydrate = useSyncExternalStore(
    abonner,
    () => true,
    () => false,
  );
  const sombre = hydrate && resolvedTheme === "dark";

  return (
    <button
      type="button"
      onClick={() => setTheme(sombre ? "light" : "dark")}
      aria-label={sombre ? t("toLight") : t("toDark")}
      className="text-muted-foreground hover:bg-muted hover:text-foreground inline-flex size-10 items-center justify-center rounded-md border"
    >
      {hydrate &&
        (sombre ? (
          <Sun aria-hidden className="size-5" />
        ) : (
          <Moon aria-hidden className="size-5" />
        ))}
    </button>
  );
}
