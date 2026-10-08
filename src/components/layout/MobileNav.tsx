"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { Menu, X } from "lucide-react";
import { SidebarAccount } from "./SidebarAccount";
import { SidebarNav } from "./SidebarNav";

/**
 * Menu de l'espace authentifié sous `lg` : même barre latérale que sur
 * grand écran (marque, sections, compte), en panneau par-dessus le
 * contenu, fermé au choix d'une entrée (`onNavigate`) et par Échap.
 */
export function MobileNav({ marque }: Readonly<{ marque: ReactNode }>) {
  const t = useTranslations("nav");
  const [ouvert, setOuvert] = useState(false);
  const fermer = () => setOuvert(false);

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
        className="hover:bg-muted inline-flex size-10 items-center justify-center rounded-md border lg:hidden"
      >
        <Menu aria-hidden className="size-5" />
      </button>
      {ouvert && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <button
            type="button"
            aria-label={t("closeMenu")}
            onClick={fermer}
            className="bg-(--overlay) absolute inset-0"
          />
          <div className="bg-canvas animate-landing-fade-up absolute inset-y-0 left-0 flex w-(--sidebar-width) max-w-[85vw] flex-col shadow-(--shadow-modal)">
            <div className="flex items-center gap-2 p-3">
              {/* Un clic sur la marque mène au tableau de bord : on ferme. */}
              <div className="min-w-0 flex-1" onClickCapture={fermer}>
                {marque}
              </div>
              <button
                type="button"
                onClick={fermer}
                aria-label={t("closeMenu")}
                className="hover:bg-sidebar-hover inline-flex size-10 shrink-0 items-center justify-center rounded-md"
              >
                <X aria-hidden className="size-5" />
              </button>
            </div>
            <div className="scrollbar-fine flex-1 overflow-y-auto px-3 py-3">
              <SidebarNav onNavigate={fermer} />
            </div>
            <div className="border-sidebar-border mx-3 border-t py-3">
              <SidebarAccount onNavigate={fermer} />
            </div>
          </div>
        </div>
      )}
    </>
  );
}
