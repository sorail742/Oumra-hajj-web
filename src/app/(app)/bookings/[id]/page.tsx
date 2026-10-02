import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Can } from "@/components/shared/Can";
import { BookingDetailScreen } from "@/features/bookings/components/BookingDetailScreen";
import { BookingDocumentsReview } from "@/features/documents/components/BookingDocumentsReview";
import { MessagingSection } from "@/features/messaging/components/MessagingSection";
import { InitiatePaymentFlow } from "@/features/payments/components/InitiatePaymentFlow";

/**
 * Compose plusieurs domaines (réservations, documents, paiements, messagerie) — c'est le rôle d'une
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
      <Can role="pilgrim">
        <InitiatePaymentFlow bookingId={id} />
      </Can>
      <Can role="agency">
        <BookingDocumentsReview bookingId={id} />
      </Can>
      <MessagingSection bookingId={id} />
    </div>
  );
}
