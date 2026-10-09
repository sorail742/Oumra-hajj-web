import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { CapacityScreen } from "@/features/capacity/components/CapacityScreen";

/** Simulateur de capacité (idée #68). */
export default async function CapacityPage() {
  const t = await getTranslations("capacity");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="agency">
        <CapacityScreen />
      </Can>
    </div>
  );
}
