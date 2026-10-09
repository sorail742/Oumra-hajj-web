import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { FileSignature, ReceiptText } from "lucide-react";

/** Accès à la facture et au contrat d'une réservation (idée #37). */
export async function BillingLinks({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = await getTranslations("billing");
  const base = `/bookings/${encodeURIComponent(bookingId)}`;
  return (
    <section className="bg-card flex flex-wrap items-center justify-between gap-3 rounded-lg border p-4 shadow-(--shadow-card)">
      <div className="space-y-0.5">
        <h2 className="font-medium">{t("linksTitle")}</h2>
        <p className="text-muted-foreground text-sm">{t("linksHint")}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {[
          {
            href: `${base}/invoice`,
            label: t("invoiceLink"),
            Icone: ReceiptText,
          },
          {
            href: `${base}/contract`,
            label: t("contractLink"),
            Icone: FileSignature,
          },
        ].map(({ href, label, Icone }) => (
          <Link
            key={href}
            href={href}
            className="hover:bg-muted inline-flex h-9 items-center gap-2 rounded-md border px-3 text-sm font-medium"
          >
            <Icone aria-hidden className="size-4" />
            {label}
          </Link>
        ))}
      </div>
    </section>
  );
}
