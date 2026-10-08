"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { Bell } from "lucide-react";
import { useNotifications } from "@/lib/notifications/use-notifications";

/**
 * Cloche de l'en-tête (ticket #68) : nombre de notifications non lues,
 * rafraîchi chaque minute, lien vers `/notifications`. Le nombre est dans
 * le nom accessible, pas seulement dans la pastille.
 */
const PLAFOND_AFFICHE = 9;

export function NotificationBell() {
  const t = useTranslations("notifications");
  const { data } = useNotifications(true);
  const nonLues = data?.length ?? 0;

  return (
    <Link
      href="/notifications"
      aria-label={t("bellLabel", { count: nonLues })}
      className="text-muted-foreground hover:bg-muted hover:text-foreground relative inline-flex size-10 items-center justify-center rounded-md border"
    >
      <Bell aria-hidden className="size-5" />
      {nonLues > 0 && (
        <span
          aria-hidden
          className="bg-destructive text-destructive-foreground absolute -top-1 -right-1 inline-flex min-w-4 items-center justify-center rounded-full px-1 text-2xs font-semibold"
        >
          {nonLues > PLAFOND_AFFICHE ? `${PLAFOND_AFFICHE}+` : nonLues}
        </span>
      )}
    </Link>
  );
}
