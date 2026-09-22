"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Copy, RefreshCw, AlertTriangle } from "lucide-react";
import {
  useCalendarSubscription,
  useRegenerateCalendarSubscription,
} from "../api/use-calendar";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function CalendarSubscriptionCard() {
  const t = useTranslations("calendar");
  const query = useCalendarSubscription();
  const regenerateMutation = useRegenerateCalendarSubscription();
  const [isCopied, setIsCopied] = useState(false);

  const handleCopy = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      setIsCopied(true);
      toast.success(t("copySuccess"));
      setTimeout(() => setIsCopied(false), 2000);
    } catch {
      toast.error(t("copyError"));
    }
  };

  const handleRegenerate = () => {
    if (window.confirm(t("regenerateWarning"))) {
      regenerateMutation.mutate(undefined, {
        onSuccess: () => {
          toast.success(t("regenerateSuccess"));
        },
        onError: () => {
          toast.error(t("regenerateError"));
        },
      });
    }
  };

  return (
    <AsyncBoundary
      query={query}
      skeleton={<div className="h-40 bg-muted animate-pulse rounded-lg" />}
    >
      {(subscription) => (
        <div className="rounded-lg border p-6 space-y-4 max-w-2xl">
          <div className="space-y-1">
            <h3 className="text-lg font-medium">{t("cardTitle")}</h3>
            <p className="text-sm text-muted-foreground">
              {t("cardDescription")}
            </p>
          </div>

          <div className="flex items-center gap-2">
            <code className="flex-1 bg-muted px-3 py-2 rounded-md text-sm break-all">
              {subscription.url}
            </code>
            <Button
              variant="outline"
              size="icon"
              onClick={() => handleCopy(subscription.url)}
              title={t("copyAction")}
            >
              <Copy className="h-4 w-4" />
            </Button>
          </div>

          <div className="bg-warning/10 text-warning p-4 rounded-md flex items-start gap-3 text-sm">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <div>
              <p className="font-medium">{t("warningTitle")}</p>
              <p className="mt-1 opacity-90">{t("warningDescription")}</p>
            </div>
          </div>

          <div className="pt-2">
            <Button
              variant="destructive"
              onClick={handleRegenerate}
              disabled={regenerateMutation.isPending}
              className="gap-2"
            >
              <RefreshCw
                className={`h-4 w-4 ${regenerateMutation.isPending ? "animate-spin" : ""}`}
              />
              {t("regenerateAction")}
            </Button>
          </div>
        </div>
      )}
    </AsyncBoundary>
  );
}
