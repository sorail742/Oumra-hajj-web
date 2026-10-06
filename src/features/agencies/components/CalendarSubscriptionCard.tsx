"use client";

import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  useCalendarSubscription,
  useRegenerateCalendarSubscription,
} from "../api/use-calendar";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { CopyButton } from "@/components/shared/CopyButton";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lien d'abonnement ICS de l'agence (ticket #50). Le lien est un secret :
 * affiché pour être copié, jamais journalisé. Régénérer révoque l'ancien
 * lien — confirmation explicite dans un dialogue accessible.
 */
function RegenererLien() {
  const t = useTranslations("calendar");
  const regeneration = useRegenerateCalendarSubscription();

  return (
    <ConfirmDialog
      trigger={
        <Button variant="outline" className="gap-2">
          <RefreshCw aria-hidden className="size-4" />
          {t("regenerateAction")}
        </Button>
      }
      title={t("regenerateAction")}
      description={t("regenerateWarning")}
      confirmLabel={t("regenerateConfirm")}
      destructive
      enCours={regeneration.isPending}
      onConfirm={() =>
        regeneration.mutateAsync().then(
          () => toast.success(t("regenerateSuccess")),
          (erreur: unknown) => {
            toast.error(t("regenerateError"));
            throw erreur;
          },
        )
      }
    />
  );
}

export function CalendarSubscriptionCard() {
  const t = useTranslations("calendar");
  const query = useCalendarSubscription();

  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-40 w-full max-w-2xl" />}
      isEmpty={() => false}
    >
      {(abonnement) => (
        <section className="bg-card max-w-2xl space-y-4 rounded-xl border p-5">
          <div className="space-y-1">
            <h2 className="text-base font-semibold">{t("cardTitle")}</h2>
            <p className="text-muted-foreground text-sm">
              {t("cardDescription")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="bg-muted flex-1 rounded-md px-3 py-2 font-mono text-xs break-all">
              {abonnement.url}
            </code>
            <CopyButton value={abonnement.url} label={t("copyAction")} />
          </div>
          <p className="text-muted-foreground text-sm">{t("howTo")}</p>

          <div className="bg-state-warning-bg flex items-start gap-3 rounded-md p-4 text-sm">
            <AlertTriangle
              aria-hidden
              className="text-state-warning size-5 shrink-0"
            />
            <div className="space-y-1">
              <p className="font-medium">{t("warningTitle")}</p>
              <p>{t("secretWarning")}</p>
              <p>{t("warningDescription")}</p>
            </div>
          </div>

          <RegenererLien />
        </section>
      )}
    </AsyncBoundary>
  );
}
