import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { ProfileScreen } from "@/features/profile/components/ProfileScreen";

/** Profil de l'utilisateur courant (`GET`/`PATCH /users/me`, ticket #30). */
export default async function ProfilePage() {
  const t = await getTranslations("profile");
  return (
    <div className="space-y-6">
      <PageHeader title={t("title")} description={t("description")} />
      <ProfileScreen />
    </div>
  );
}
