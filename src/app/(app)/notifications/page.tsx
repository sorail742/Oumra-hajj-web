import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Skeleton } from "@/components/ui/skeleton";
import { NotificationsScreen } from "@/features/notifications/components/NotificationsScreen";

/** Centre de notifications, tous rôles (ticket #68). */
export default async function NotificationsPage() {
  const t = await getTranslations("notifications");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* Filtre lu dans l'URL (`useSearchParams`) : frontière Suspense requise. */}
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <NotificationsScreen />
      </Suspense>
    </div>
  );
}
