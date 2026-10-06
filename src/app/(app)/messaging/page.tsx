import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { InboxScreen } from "@/features/messaging/components/InboxScreen";

/** Boîte de réception — pèlerin, guide et agence (ticket #67). */
export default async function MessagingPage() {
  const t = await getTranslations("messaging.inbox");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Suspense>
        <InboxScreen />
      </Suspense>
    </div>
  );
}
