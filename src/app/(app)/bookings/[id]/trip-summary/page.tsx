import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { TripSummaryBooklet } from "@/features/trip-summary/components/TripSummaryBooklet";

export default async function TripSummaryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("nav");

  return (
    <div className="space-y-8">
      <PageHeader title={t("tripSummary")} />
      <TripSummaryBooklet bookingId={id} />
    </div>
  );
}

