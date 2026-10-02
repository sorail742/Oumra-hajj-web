import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";

/**
 * Mot de passe oublié (agence / admin). Le backend n'expose pas encore de
 * réinitialisation (`AuthController` : aucune route dédiée) — la page le
 * dit honnêtement plutôt que d'afficher un formulaire sans effet.
 */
export default async function ForgotPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell title={t("forgot.title")} subtitle={t("forgot.body")}>
      <Link
        href="/login"
        className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
      >
        <ArrowLeft aria-hidden className="size-4" />
        {t("forgot.back")}
      </Link>
    </AuthShell>
  );
}
