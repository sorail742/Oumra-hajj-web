import { getTranslations } from "next-intl/server";
import { BudgetPage } from "./BudgetPage";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";

/** Simulateur de budget du pèlerin (backend #2). */
export default async function Page() {
  const t = await getTranslations("budget");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can
        role="pilgrim"
        fallback={
          <p className="text-muted-foreground text-sm">{t("pilgrimOnly")}</p>
        }
      >
        <BudgetPage />
      </Can>
    </div>
  );
}
