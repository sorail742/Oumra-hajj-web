import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { AgenciesListScreen } from "@/features/agencies/components/AgenciesListScreen";

export default async function AgenciesPage() {
  const t = await getTranslations("agencies");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* Filtre lu dans l'URL (`useSearchParams`) : frontière Suspense requise. */}
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <AgenciesListScreen />
      </Suspense>
    </div>
  );
}
