import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Can } from "@/components/shared/Can";
import { BookingDetailScreen } from "@/features/bookings/components/BookingDetailScreen";
import { ChecklistPanel } from "@/features/checklist/components/ChecklistPanel";
import { BookingDocumentsReview } from "@/features/documents/components/BookingDocumentsReview";
import { DocumentUploader } from "@/features/documents/components/DocumentUploader";
import { MessagingSection } from "@/features/messaging/components/MessagingSection";
import { InitiatePaymentFlow } from "@/features/payments/components/InitiatePaymentFlow";

/**
 * Compose plusieurs domaines (réservations, documents, paiements, checklist, messagerie) — c'est le rôle d'une
 * page, pas d'un `features/*`, qui n'importe jamais un autre `features/*`
 * (voir `CLAUDE.md` règle 2).
 */
export default async function BookingDetailPage({
  params,
  searchParams,
}: Readonly<{
  params: Promise<{ id: string }>;
  searchParams: Promise<{ nouvelle?: string }>;
}>) {
  const { id } = await params;
  const { nouvelle } = await searchParams;
  const t = await getTranslations("bookings");

  return (
    <div className="space-y-8">
      <PageHeader title={t("detailTitle")} />
      {nouvelle === "1" && (
        <output className="bg-state-success-bg text-state-success block rounded-lg px-4 py-3 text-sm font-medium">
          {t("createdBanner")}
        </output>
      )}
      <BookingDetailScreen id={id} />
      <Can role="pilgrim">
        <InitiatePaymentFlow bookingId={id} />
        <DocumentUploader bookingId={id} />
        <ChecklistPanel bookingId={id} />
      </Can>
      <Can role="agency">
        <BookingDocumentsReview bookingId={id} />
      </Can>
      <MessagingSection bookingId={id} />
    </div>
  );
}
