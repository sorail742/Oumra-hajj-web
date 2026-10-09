import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { SimulateurRentabilite } from "./SimulateurRentabilite";

/** Simulateur de rentabilité (idée #48). */
export default async function ProfitabilityPage() {
  const t = await getTranslations("profitability");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="agency">
        <SimulateurRentabilite />
      </Can>
    </div>
  );
}
