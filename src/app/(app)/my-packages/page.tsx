import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyPackagesScreen } from "@/features/packages/components/MyPackagesScreen";

/**
 * Forfaits de l'agence (ticket #33). Hors du préfixe public `/packages`
 * (`src/proxy.ts`) : cet écran exige une session.
 */
export default async function MyPackagesPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ enregistre?: string }> }>) {
  const { enregistre } = await searchParams;
  const t = await getTranslations("packages.manage");
  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <PageHeader title={t("title")} description={t("description")} />
        <Link
          href="/my-packages/new"
          className="bg-primary text-primary-foreground hover:bg-primary-hover inline-flex h-9 items-center gap-2 rounded-md px-4 text-sm font-medium"
        >
          <Plus aria-hidden className="size-4" />
          {t("create")}
        </Link>
      </div>
      {enregistre === "1" && (
        <output className="bg-state-success-bg text-state-success block rounded-lg px-4 py-3 text-sm font-medium">
          {t("form.saved")}
        </output>
      )}
      <MyPackagesScreen />
    </div>
  );
}
