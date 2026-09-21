import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { AgenciesListScreen } from "@/features/agencies/components/AgenciesListScreen";

export default async function AgenciesPage() {
  const t = await getTranslations("agencies");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <AgenciesListScreen />
    </div>
  );
}

