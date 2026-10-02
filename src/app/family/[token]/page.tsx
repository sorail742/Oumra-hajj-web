import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Croissant } from "@/components/shared/illustrations/Geometrie";
import { VueFamille } from "./VueFamille";

/**
 * Page publique d'un proche (ticket #75) : sans coquille de l'espace,
 * jamais indexée — le lien contient un secret (voir `src/proxy.ts`).
 */
export const metadata: Metadata = {
  robots: { index: false, follow: false },
  referrer: "no-referrer",
};

export default async function FamilyPage({
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
      <main className="mx-auto w-full max-w-2xl px-4 py-8 sm:px-6">
        <VueFamille token={token} />
      </main>
    </div>
  );
}
