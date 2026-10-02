import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { RegisterAgencyForm } from "@/features/auth/components/RegisterAgencyForm";

/** Inscription agence (`POST /agencies/register`). */
export default async function RegisterAgencyPage() {
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("register.title")}
      subtitle={t("register.subtitle")}
      footer={
        <p>
          {t("register.hasAccount")}{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            {t("register.login")}
          </Link>
        </p>
      }
    >
      <RegisterAgencyForm />
    </AuthShell>
  );
}
