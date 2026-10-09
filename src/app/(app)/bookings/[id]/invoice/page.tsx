import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { PrintButton } from "@/components/shared/PrintButton";
import { InvoiceDocument } from "@/features/payments/components/InvoiceDocument";

/** Document imprimable d'une réservation (idée #37). */
export default async function Page({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  const t = await getTranslations("billing");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 print:hidden">
        <Link
          href={`/bookings/${encodeURIComponent(id)}`}
          className="text-muted-foreground hover:text-foreground inline-flex items-center gap-1 text-sm"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("backToBooking")}
        </Link>
        <PrintButton />
      </div>
      <InvoiceDocument bookingId={id} />
    </div>
  );
}
