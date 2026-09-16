import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { BookingDetailScreen } from "@/features/bookings/components/BookingDetailScreen";

export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("bookings");

  return (
    <div>
      <PageHeader title={t("detailTitle")} />
      <BookingDetailScreen id={id} />
    </div>
  );
}
