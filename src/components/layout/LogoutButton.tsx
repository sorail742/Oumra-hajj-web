"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { LogOut } from "lucide-react";
import { api } from "@/lib/api/client";

/**
 * Déconnexion : `/api/session/logout` révoque le refresh token côté backend
 * et efface les cookies. Le cache TanStack Query est vidé, puis retour à
 * l'accueil — même si la révocation a échoué, la session de ce navigateur
 * est close (les cookies sont effacés côté serveur dans tous les cas).
 */
export function LogoutButton() {
  const t = useTranslations("auth");
  const router = useRouter();
  const queryClient = useQueryClient();
  const [enCours, setEnCours] = useState(false);

  async function deconnecter() {
    setEnCours(true);
    await api.post<undefined>("/api/session/logout").catch(() => undefined);
    queryClient.clear();
    router.replace("/");
    router.refresh();
  }

  return (
    <button
      type="button"
      onClick={() => {
        deconnecter().catch(() => undefined);
      }}
      disabled={enCours}
      role="menuitem"
      className="text-muted-foreground hover:bg-muted hover:text-foreground flex h-9 w-full items-center gap-2 rounded-md px-3 text-sm disabled:opacity-50"
    >
      <LogOut aria-hidden className="size-4" />
      {t("logout")}
    </button>
  );
}
