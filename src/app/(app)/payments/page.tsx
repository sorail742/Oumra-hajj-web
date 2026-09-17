import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PaymentsListScreen } from "@/features/payments/components/PaymentsListScreen";

export default async function PaymentsPage() {
  const t = await getTranslations("payments");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <PaymentsListScreen />
    </div>
  );
}
