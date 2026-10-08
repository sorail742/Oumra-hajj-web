import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { DisputesListScreen } from "@/features/disputes/components/DisputesListScreen";
import { OuvrirLitige } from "./OuvrirLitige";

/** Médiation des litiges (idée #62). */
export default async function DisputesPage() {
  const t = await getTranslations("disputes");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Can role="pilgrim">
            <OuvrirLitige />
          </Can>
        }
      />
      <DisputesListScreen />
    </div>
  );
}
