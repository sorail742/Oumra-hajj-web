import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { MyAgencyScreen } from "@/features/agencies/components/MyAgencyScreen";
import { MyGuidesSection } from "@/features/agencies/components/MyGuidesSection";
import { RefundPolicyEditor } from "@/features/payments/components/RefundPolicyEditor";

/**
 * Profil de l'agence connectée (ticket #47), ses guides (#64) et son
 * barème de remboursement (idée #58) — compose deux domaines (règle 2).
 */
export default async function MyAgencyPage() {
  const t = await getTranslations("myAgency");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <MyAgencyScreen />
      <MyGuidesSection />
      <RefundPolicyEditor />
    </div>
  );
}
