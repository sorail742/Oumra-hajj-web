import { Suspense } from "react";
import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { TableSkeleton } from "@/components/shared/TableSkeleton";
import { UsersAdminScreen } from "@/features/admin/components/UsersAdminScreen";

/** Gestion des utilisateurs — administrateur (ticket #74). */
export default async function UsersPage() {
  const t = await getTranslations("adminUsers");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      {/* Filtres lus dans l'URL (`useSearchParams`) : frontière Suspense requise. */}
      <Suspense fallback={<TableSkeleton rows={6} />}>
        <UsersAdminScreen />
      </Suspense>
    </div>
  );
}
