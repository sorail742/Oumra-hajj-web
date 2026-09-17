import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { RiteSheetsScreen } from "@/features/rites/components/RiteSheetsScreen";
import { RiteProgressChecklist } from "@/features/rites/components/RiteProgressChecklist";

export default async function RitesPage() {
  const t = await getTranslations("rites");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />

      <section>
        <h2 className="mb-3 text-lg font-medium">{t("sheetsTitle")}</h2>
        <RiteSheetsScreen />
      </section>

      <section>
        <h2 className="mb-3 text-lg font-medium">{t("progressTitle")}</h2>
        <RiteProgressChecklist />
      </section>
    </div>
  );
}
