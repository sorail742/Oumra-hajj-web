"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  Bell,
  BookOpen,
  CreditCard,
  FileText,
  MessagesSquare,
  ShieldCheck,
  Ticket,
} from "lucide-react";
import { toast } from "sonner";
import {
  useMarquerLue,
  useNotifications,
  useToutMarquerLu,
  type AppNotification,
} from "@/lib/notifications/use-notifications";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { RelativeTime } from "@/components/shared/RelativeTime";
import { SegmentedControl } from "@/components/shared/SegmentedControl";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { cn } from "cn";

/**
 * Centre de notifications (ticket #68). Filtre « non lues / toutes » dans
 * l'URL (règle 8), non lues par défaut. Une notification critique (SOS…)
 * est signalée par un libellé, pas seulement par la couleur.
 */

const ICONES: Record<AppNotification["type"], LucideIcon> = {
  booking_status: Ticket,
  payment: CreditCard,
  document: FileText,
  rite_reminder: BookOpen,
  sos: AlertTriangle,
  group_message: MessagesSquare,
  moderation: ShieldCheck,
  other: Bell,
};

function Element({
  notification,
}: Readonly<{ notification: AppNotification }>) {
  const t = useTranslations("notifications");
  const marquer = useMarquerLue();
  const Icone = ICONES[notification.type];
  const nonLue = notification.readAt === undefined;

  return (
    <li
      className={cn("flex gap-4 px-4 py-4", nonLue && "bg-primary-subtle/40")}
    >
      <span
        className={cn(
          "inline-flex size-9 shrink-0 items-center justify-center rounded-full",
          notification.isCritical
            ? "bg-state-danger-bg text-state-danger"
            : "bg-muted text-muted-foreground",
        )}
      >
        <Icone aria-hidden className="size-4" />
      </span>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className={cn("text-sm", nonLue && "font-semibold")}>
            {notification.title}
          </p>
          {notification.isCritical && (
            <span className="bg-state-danger-bg text-state-danger rounded px-1.5 text-2xs font-semibold uppercase">
              {t("critical")}
            </span>
          )}
          {nonLue && <span className="sr-only">{t("unreadLabel")}</span>}
        </div>
        <p className="text-muted-foreground text-sm">{notification.content}</p>
        <p className="text-muted-foreground text-xs">
          <RelativeTime iso={notification.createdAt} />
        </p>
      </div>
      {nonLue && (
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 self-start"
          disabled={marquer.isPending}
          onClick={() => {
            marquer.mutateAsync(notification.id).catch(() => {
              toast.error(t("markError"));
            });
          }}
        >
          {t("markRead")}
        </Button>
      )}
    </li>
  );
}

export function NotificationsScreen() {
  const t = useTranslations("notifications");
  const params = useSearchParams();
  const router = useRouter();
  const toutes = params.get("filtre") === "toutes";
  const query = useNotifications(!toutes);
  const toutMarquer = useToutMarquerLu();
  const nonLues = (query.data ?? []).filter((n) => n.readAt === undefined);

  function choisir(suivant: boolean) {
    router.replace(suivant ? "?filtre=toutes" : "?", { scroll: false });
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <SegmentedControl
          label={t("filterLabel")}
          value={toutes ? "toutes" : "non-lues"}
          onChange={(valeur) => choisir(valeur === "toutes")}
          options={[
            { value: "non-lues", label: t("filterUnread") },
            { value: "toutes", label: t("filterAll") },
          ]}
        />
        {nonLues.length > 0 && (
          <Button
            variant="outline"
            size="sm"
            disabled={toutMarquer.isPending}
            onClick={() => {
              toutMarquer
                .mutateAsync(nonLues.map((n) => n.id))
                .catch(() => toast.error(t("markError")));
            }}
          >
            {t("markAllRead")}
          </Button>
        )}
      </div>
      <AsyncBoundary
        query={query}
        skeleton={
          <div className="space-y-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
        }
        empty={
          <EmptyState
            title={toutes ? t("emptyAll") : t("emptyUnread")}
            description={t("emptyDescription")}
          />
        }
      >
        {(notifications) => (
          <ul className="bg-card divide-y overflow-hidden rounded-xl border">
            {notifications.map((n) => (
              <Element key={n.id} notification={n} />
            ))}
          </ul>
        )}
      </AsyncBoundary>
    </div>
  );
}
