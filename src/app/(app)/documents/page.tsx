import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { DocumentsListScreen } from "@/features/documents/components/DocumentsListScreen";
import { MyDocumentsExpiryAlerts } from "@/features/documents/components/ExpiryAlerts";
import { Can } from "@/components/shared/Can";

export default async function DocumentsPage() {
  const t = await getTranslations("documents");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="pilgrim">
        <MyDocumentsExpiryAlerts />
      </Can>
      <DocumentsListScreen />
    </div>
  );
}
