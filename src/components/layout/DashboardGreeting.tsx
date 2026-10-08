"use client";

import { useTranslations } from "next-intl";
import { formatDateLongue } from "@/lib/format";
import { useCurrentUser } from "@/lib/auth/use-current-user";

/**
 * En-tête du tableau de bord : salutation par le prénom (`GET /users/me`)
 * et date du jour. `description` est la phrase propre au rôle, choisie
 * par la page (`<Can>`), jamais ici.
 */
export function DashboardGreeting({
  description,
}: Readonly<{ description: string }>) {
  const t = useTranslations("dashboard");
  const { data: utilisateur } = useCurrentUser();
  const prenom = utilisateur?.fullName.trim().split(/\s+/)[0];

  return (
    <div className="mb-6 space-y-1">
      <p
        className="text-muted-foreground text-sm first-letter:uppercase"
        suppressHydrationWarning
      >
        {formatDateLongue(new Date())}
      </p>
      <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
        {prenom ? t("greeting", { name: prenom }) : t("greetingNoName")}
      </h1>
      <p className="text-muted-foreground text-sm">{description}</p>
    </div>
  );
}
