import { getTranslations } from "next-intl/server";
import { GroupDetail } from "./GroupDetail";
import { PageHeader } from "@/components/shared/PageHeader";

export default async function GroupDetailPage({
  params,
}: Readonly<{
  params: Promise<{ id: string }>;
}>) {
  const { id } = await params;
  const t = await getTranslations("groups");

  return (
    <div>
      <PageHeader title={t("detailTitle")} />
      <GroupDetail id={id} />
    </div>
  );
}
