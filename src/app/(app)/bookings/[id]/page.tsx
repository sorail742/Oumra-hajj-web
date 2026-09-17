import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { BookingDetailScreen } from "@/features/bookings/components/BookingDetailScreen";
import { MessagingSection } from "@/features/messaging/components/MessagingSection";

/**
 * Compose deux domaines (réservations, messagerie) — c'est le rôle d'une
 * page, pas d'un `features/*`, qui n'importe jamais un autre `features/*`
 * (voir `CLAUDE.md` règle 2).
 */
export default async function BookingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("bookings");

  return (
    <div className="space-y-8">
      <PageHeader title={t("detailTitle")} />
      <BookingDetailScreen id={id} />
      <MessagingSection bookingId={id} />
    </div>
  );
}
