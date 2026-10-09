import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Croissant } from "@/components/shared/illustrations/Geometrie";
import { SharedQuoteScreen } from "@/features/quotes/components/SharedQuoteScreen";

/**
 * Devis reçu par lien (idée #49), sans compte ni coquille de l'espace,
 * jamais indexé — le lien contient un secret (voir `src/proxy.ts`).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function SharedQuotePage({
  params,
}: Readonly<{ params: Promise<{ token: string }> }>) {
  const { token } = await params;
  const t = await getTranslations("landing");

  return (
    <div className="min-h-svh">
      <header className="bg-background flex h-14 items-center border-b px-4 sm:px-6">
        <Link
          href="/"
          className="flex items-center gap-2 text-sm font-semibold tracking-tight"
        >
          <Croissant className="size-5" />
          {t("brand")}
        </Link>
      </header>
      <main className="mx-auto w-full max-w-3xl px-4 py-8 sm:px-6">
        <SharedQuoteScreen token={token} />
      </main>
    </div>
  );
}
