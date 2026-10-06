import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaymentsListScreen } from "@/features/payments/components/PaymentsListScreen";
import { TreasuryCard } from "@/features/payments/components/TreasuryCard";

export default async function PaymentsPage() {
  const t = await getTranslations("payments");

  return (
    <div className="space-y-8">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="agency">
        <TreasuryCard />
      </Can>
      <PaymentsListScreen />
    </div>
  );
}
