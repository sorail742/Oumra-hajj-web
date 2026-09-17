"use client";

import { useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import { api } from "@/lib/api/client";
import { cn } from "@/lib/utils";

/**
 * Pression maintenue plutôt qu'un tap simple — validé explicitement avec
 * l'utilisateur (voir `docs/design-system.md` § Surfaces et interaction,
 * qui laissait ce choix ouvert). `POST /groups/:id/sos` alerte
 * immédiatement le guide et le contact d'urgence par SMS
 * (`GroupsService.triggerSos`) : un tap accidentel a un coût réel.
 *
 * Le déclenchement dépend d'un `setTimeout` (testable, déterministe), pas
 * de l'événement `transitionend` du remplissage visuel — la barre de
 * progression CSS est purement décorative, jamais la source de vérité de
 * « la pression a assez duré ».
 */
const DUREE_PRESSION_MS = 2000;

export function SosButton({ groupId }: { groupId: string }) {
  const t = useTranslations("groups");
  const [enPression, setEnPression] = useState(false);
  const minuteur = useRef<ReturnType<typeof setTimeout> | null>(null);

  const sos = useMutation({
    mutationFn: async () => {
      await api.post<undefined>(`/api/groups/${groupId}/sos`);
    },
    onSuccess: () => toast.success(t("sosSent")),
    onError: () => toast.error(t("sosError")),
  });

  function demarrer() {
    if (sos.isPending || minuteur.current) {
      return;
    }
    setEnPression(true);
    minuteur.current = setTimeout(() => {
      minuteur.current = null;
      setEnPression(false);
      sos.mutate();
    }, DUREE_PRESSION_MS);
  }

  function annuler() {
    if (minuteur.current) {
      clearTimeout(minuteur.current);
      minuteur.current = null;
    }
    setEnPression(false);
  }

  function surTouche(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") {
      e.preventDefault();
      demarrer();
    }
  }

  function surRelacheTouche(e: React.KeyboardEvent<HTMLButtonElement>) {
    if (e.key === " " || e.key === "Enter") {
      annuler();
    }
  }

  return (
    <div className="inline-flex flex-col items-center gap-1">
      <button
        type="button"
        aria-pressed={enPression}
        aria-label={t("sosButtonLabel")}
        disabled={sos.isPending}
        onPointerDown={demarrer}
        onPointerUp={annuler}
        onPointerLeave={annuler}
        onKeyDown={surTouche}
        onKeyUp={surRelacheTouche}
        className="bg-destructive text-destructive-foreground relative isolate touch-none overflow-hidden rounded-md px-6 py-3 text-sm font-semibold select-none"
      >
        <span
          aria-hidden
          className={cn(
            "bg-destructive-foreground/25 absolute inset-0 -z-10 origin-left",
            enPression
              ? "scale-x-100 transition-transform ease-linear"
              : "scale-x-0 transition-transform duration-150",
          )}
          style={
            enPression
              ? { transitionDuration: `${DUREE_PRESSION_MS}ms` }
              : undefined
          }
        />
        {t("sosButtonLabel")}
      </button>
      <span className="text-muted-foreground text-xs">
        {t("sosButtonHint")}
      </span>
    </div>
  );
}
