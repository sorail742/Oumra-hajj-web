import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { AuditLogScreen } from "@/features/audit/components/AuditLogScreen";

/** Piste d'audit (idée #85) — administration. */
export default async function AuditPage() {
  const t = await getTranslations("audit");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="admin">
        <AuditLogScreen />
      </Can>
    </div>
  );
}
