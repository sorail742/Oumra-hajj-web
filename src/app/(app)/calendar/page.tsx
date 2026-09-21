import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { CalendarSubscriptionCard } from "@/features/agencies/components/CalendarSubscriptionCard";

export default async function CalendarPage() {
  const t = await getTranslations("calendar");

  return (
    <div className="space-y-6">
      <PageHeader title={t("pageTitle")} description={t("pageDescription")} />
      <CalendarSubscriptionCard />
    </div>
  );
}

