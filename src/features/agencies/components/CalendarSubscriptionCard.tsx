"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { AlertTriangle, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import {
  useCalendarSubscription,
  useRegenerateCalendarSubscription,
} from "../api/use-calendar";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * Lien d'abonnement ICS de l'agence (ticket #50). Le lien est un secret :
 * affiché pour être copié, jamais journalisé. Régénérer révoque l'ancien
 * lien — confirmation explicite dans un dialogue accessible.
 */
function RegenererLien() {
  const t = useTranslations("calendar");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const regeneration = useRegenerateCalendarSubscription();

  function confirmer() {
    regeneration.mutate(undefined, {
      onSuccess: () => {
        toast.success(t("regenerateSuccess"));
        setOuvert(false);
      },
      onError: () => toast.error(t("regenerateError")),
    });
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="outline" className="gap-2">
          <RefreshCw aria-hidden className="size-4" />
          {t("regenerateAction")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-md)">
        <DialogHeader>
          <DialogTitle>{t("regenerateAction")}</DialogTitle>
          <DialogDescription>{t("regenerateWarning")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant="destructive"
            onClick={confirmer}
            disabled={regeneration.isPending}
          >
            {t("regenerateConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
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
