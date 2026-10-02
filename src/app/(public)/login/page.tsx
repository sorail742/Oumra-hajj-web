import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AgencyLoginForm } from "@/features/auth/components/AgencyLoginForm";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { BandeauSucces } from "@/features/auth/components/champs";

/**
 * Connexion agence / admin — email + mot de passe, session ouverte par
 * `/api/session/agency` (cookies `httpOnly`, ADR-0002).
 */
export default async function LoginPage({
  searchParams,
}: Readonly<{
  searchParams: Promise<{ next?: string; registered?: string }>;
}>) {
  const { next, registered } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("agency.title")}
      subtitle={t("agency.subtitle")}
      footer={
        <>
          <p>
            {t("agency.noAccount")}{" "}
            <Link
              href="/register-agency"
              className="text-primary font-medium hover:underline"
            >
              {t("agency.register")}
            </Link>
          </p>
          <p>
            {t("agency.pilgrimLink")}{" "}
            <Link
              href="/otp"
              className="text-primary font-medium hover:underline"
            >
              {t("agency.pilgrimAction")}
            </Link>
          </p>
        </>
      }
    >
      {registered === "1" && <BandeauSucces message={t("agency.registered")} />}
      <AgencyLoginForm next={next} />
    </AuthShell>
  );
}
