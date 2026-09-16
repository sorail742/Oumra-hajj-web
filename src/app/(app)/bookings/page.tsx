import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { BookingsListScreen } from "@/features/bookings/components/BookingsListScreen";

export default async function BookingsPage() {
  const t = await getTranslations("bookings");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <BookingsListScreen />
    </div>
  );
}
