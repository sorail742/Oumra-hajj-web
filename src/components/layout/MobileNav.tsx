"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { SidebarNav } from "./SidebarNav";

/**
 * Menu de l'espace authentifié sous `lg` : panneau latéral par-dessus le
 * contenu, fermé au choix d'une entrée (`onNavigate`) et par Échap.
 */
export function MobileNav() {
  const t = useTranslations("nav");
  const [ouvert, setOuvert] = useState(false);

  useEffect(() => {
    if (!ouvert) return undefined;
    const surTouche = (evenement: KeyboardEvent) => {
      if (evenement.key === "Escape") setOuvert(false);
    };
    document.addEventListener("keydown", surTouche);
    return () => document.removeEventListener("keydown", surTouche);
  }, [ouvert]);

  return (
    <>
      <button
        type="button"
        onClick={() => setOuvert(true)}
        aria-label={t("openMenu")}
        aria-expanded={ouvert}
        className="hover:bg-muted inline-flex size-9 items-center justify-center rounded-md lg:hidden"
      >
        <Menu aria-hidden className="size-5" />
      </button>
      {ouvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={() => setOuvert(false)}
            className="bg-(--overlay) absolute inset-0"
          />
          <div className="bg-sidebar border-sidebar-border animate-landing-fade-up absolute inset-y-0 left-0 flex w-(--sidebar-width) flex-col border-r shadow-(--shadow-modal)">
            <div className="flex h-14 items-center justify-end border-b px-2">
              <button
                type="button"
                onClick={() => setOuvert(false)}
                aria-label={t("closeMenu")}
                className="hover:bg-sidebar-accent inline-flex size-9 items-center justify-center rounded-md"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="scrollbar-fine flex-1 overflow-y-auto p-2">
              <SidebarNav onNavigate={() => setOuvert(false)} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
