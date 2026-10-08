import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { Can } from "@/components/shared/Can";
import { ProfileScreen } from "@/features/profile/components/ProfileScreen";
import { SpecialNeedsForm } from "@/features/profile/components/SpecialNeedsForm";

/** Profil de l'utilisateur courant (`GET`/`PATCH /users/me`, ticket #30), et
 * besoins spéciaux du pèlerin (idée #69 backend). */
export default async function ProfilePage() {
  const t = await getTranslations("profile");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ProfileScreen />
      <Can role="pilgrim">
        <SpecialNeedsForm />
      </Can>
    </div>
  );
}
