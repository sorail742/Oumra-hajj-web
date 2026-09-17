import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { GroupsListScreen } from "@/features/groups/components/GroupsListScreen";

export default async function GroupsPage() {
  const t = await getTranslations("groups");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <GroupsListScreen />
    </div>
  );
}
