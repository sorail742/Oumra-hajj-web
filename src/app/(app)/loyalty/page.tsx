import { getTranslations } from "next-intl/server";
import { Can } from "@/components/shared/Can";
import { PageHeader } from "@/components/shared/PageHeader";
import { LoyaltyMembersList } from "@/features/loyalty/components/LoyaltyMembersList";
import { LoyaltyProgramEditor } from "@/features/loyalty/components/LoyaltyProgramEditor";
import { MyLoyaltyCard } from "@/features/loyalty/components/MyLoyaltyCard";

/** Programme de fidélité (idée #47) : paliers et fidèles pour l'agence, palier pour le pèlerin. */
export default async function LoyaltyPage() {
  const t = await getTranslations("loyalty");

  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <Can role="agency">
        <div className="space-y-6">
          <LoyaltyProgramEditor />
          <LoyaltyMembersList />
        </div>
      </Can>
      <Can role="pilgrim">
        <MyLoyaltyCard />
      </Can>
    </div>
  );
}
