import Link from "next/link";
import { getTranslations } from "next-intl/server";
import { AuthShell } from "@/features/auth/components/AuthShell";
import { OtpLoginFlow } from "@/features/auth/components/OtpLoginFlow";

/**
 * Connexion pèlerin / guide — téléphone puis code SMS
 * (`POST /auth/otp/request`, puis `/api/session/otp`).
 */
export default async function OtpPage({
  searchParams,
}: Readonly<{ searchParams: Promise<{ next?: string }> }>) {
  const { next } = await searchParams;
  const t = await getTranslations("auth");

  return (
    <AuthShell
      title={t("otp.title")}
      subtitle={t("otp.subtitle")}
      footer={
        <p>
          {t("otp.agencyLink")}{" "}
          <Link
            href="/login"
            className="text-primary font-medium hover:underline"
          >
            {t("otp.agencyAction")}
          </Link>
        </p>
      }
    >
      <OtpLoginFlow next={next} />
    </AuthShell>
  );
}
