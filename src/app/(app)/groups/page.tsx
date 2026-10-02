import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { GroupsListScreen } from "@/features/groups/components/GroupsListScreen";
import { CreerGroupe } from "./CreerGroupe";

export default async function GroupsPage() {
  const t = await getTranslations("groups");

  return (
    <div className="space-y-6">
      <PageHeader
        title={t("title")}
        description={t("description")}
        action={
          <Can role="agency">
            <CreerGroupe />
          </Can>
        }
      />
      <GroupsListScreen />
    </div>
  );
}
