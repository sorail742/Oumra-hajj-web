import { getTranslations } from "next-intl/server";
import { PageHeader } from "@/components/shared/PageHeader";
import { PackagesListScreen } from "@/features/packages/components/PackagesListScreen";

/**
 * Écran de vérité de la vague 1 shadcn — voir `docs/socle-frontend.md` §9 :
 * liste paginée côté client, filtres dans l'URL, quatre états, badges de
 * statut, sur le domaine backend le plus stable (`GET /packages`, public).
 */
export default async function PackagesPage() {
  const t = await getTranslations("packages");

  return (
    <div>
      <PageHeader title={t("title")} description={t("description")} />
      <PackagesListScreen />
    </div>
  );
}
