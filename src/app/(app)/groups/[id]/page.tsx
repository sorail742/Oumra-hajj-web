import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { GroupDetailScreen } from "@/features/groups/components/GroupDetailScreen";

export default async function GroupDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const t = await getTranslations("groups");

  return (
    <div>
      <PageHeader title={t("detailTitle")} />
      <GroupDetailScreen id={id} />
    </div>
  );
}
