import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { ArrowLeft } from "lucide-react";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { ResetPasswordForm } from "@/features/auth/components/ResetPasswordForm";

/** Lien reçu par e-mail : choix du nouveau mot de passe (ticket #73). */
export default async function ResetPasswordPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("reset.title")}
      subtitle={t("reset.subtitle")}
      footer={
        <Link
          href="/login"
          className="text-primary inline-flex items-center gap-2 font-medium hover:underline"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("reset.back")}
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
