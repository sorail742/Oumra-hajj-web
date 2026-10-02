import type { ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowLeft, Check } from "lucide-react";
import { cn } from "cn";
import { CielEtoile } from "@/components/shared/illustrations/CielEtoile";
import {
  Croissant,
  PavageKhatam,
} from "@/components/shared/illustrations/Geometrie";
import { SilhouetteMecque } from "@/components/shared/illustrations/SilhouetteMecque";

/**
 * Cadre des écrans d'authentification publics : panneau de nuit illustré
 * (même univers que la page d'accueil, ADR-0005) à gauche, formulaire à
 * droite. Sur mobile, le panneau devient un bandeau compact au-dessus du
 * formulaire.
 */

const POINTS = [
  { cle: "point1", delai: "landing-delay-1" },
  { cle: "point2", delai: "landing-delay-2" },
  { cle: "point3", delai: "landing-delay-3" },
] as const;

export function AuthShell({
  title,
  subtitle,
  children,
  footer,
}: Readonly<{
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
}>) {
  const t = useTranslations("auth");
  const tAccueil = useTranslations("landing");

  return (
    <div className="grid min-h-svh lg:grid-cols-[1fr_1.1fr]">
      <aside className="bg-landing-night relative isolate flex flex-col justify-between overflow-hidden px-6 pt-6 pb-36 lg:px-12 lg:pt-10 lg:pb-64">
        <div aria-hidden className="absolute inset-0 -z-10">
          <div className="absolute inset-0 bg-[linear-gradient(180deg,var(--landing-night-deep),var(--landing-night)_60%,var(--landing-horizon))]" />
          <CielEtoile className="absolute inset-0 size-full" />
          <PavageKhatam className="text-landing-gold landing-fade-bottom absolute inset-0 size-full opacity-[0.05]" />
          <SilhouetteMecque className="absolute inset-x-0 bottom-0 h-32 w-full lg:h-60" />
        </div>

        <Link
          href="/"
          className="text-landing-on-night inline-flex w-fit items-center gap-2 text-lg font-semibold tracking-tight"
        >
          <Croissant className="size-6" />
          {tAccueil("brand")}
        </Link>

        <div className="mt-10 hidden max-w-md space-y-6 lg:block">
          <p className="animate-landing-fade-up text-landing-on-night text-3xl font-semibold tracking-tight text-balance">
            {t("panel.quote")}
          </p>
          <ul className="text-landing-on-night-muted space-y-3">
            {POINTS.map(({ cle, delai }) => (
              <li
                key={cle}
                className={cn(
                  "animate-landing-fade-up flex items-center gap-3",
                  delai,
                )}
              >
                <Check aria-hidden className="text-landing-gold size-4" />
                {t(`panel.${cle}`)}
              </li>
            ))}
          </ul>
        </div>
      </aside>

      <main className="flex flex-col px-6 py-10 sm:px-12 lg:py-16">
        <Link
          href="/"
          className="text-muted-foreground hover:text-foreground inline-flex w-fit items-center gap-2 text-sm"
        >
          <ArrowLeft aria-hidden className="size-4" />
          {t("backHome")}
        </Link>

        <div className="animate-landing-fade-up mx-auto my-auto w-full max-w-md space-y-8 py-10">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
            <p className="text-muted-foreground">{subtitle}</p>
          </div>
          {children}
          {footer && (
            <div className="text-muted-foreground space-y-2 border-t pt-6 text-sm">
              {footer}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
