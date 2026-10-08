import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import {
  AgencyPlanningScreen,
  MyPlanningScreen,
} from "@/features/guide-planning/components/GuidePlanningScreen";

/** Planning des guides (idée #42) : vue agence, ou son planning pour le guide. */
export default async function GuidePlanningPage() {
  const t = await getTranslations("guidePlanning");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="agency">
        <AgencyPlanningScreen />
      </Can>
      <Can role="guide">
        <MyPlanningScreen />
      </Can>
    </div>
  );
}
