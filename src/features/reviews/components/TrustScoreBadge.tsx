import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import type { AgencyTrustScore } from "../api/schemas";

/**
 * Marqueur de confiance, pas un statut de dossier — l'or (`accent`) est
 * réservé à ça (voir `docs/design-system.md` §1/§2), jamais les cinq tons
 * `state-*` du registre de statuts.
 */
export function TrustScoreBadge({
  badge,
}: {
  badge: AgencyTrustScore["badge"];
}) {
  const t = useTranslations("reviews");

  if (!badge) {
    return null;
  }

  const estConfiance = badge === "trusted";

  return (
    <span
      className={cn(
        "rounded-sm px-2 py-0.5 text-2xs font-medium",
        estConfiance
          ? "bg-accent text-accent-foreground"
          : "bg-muted text-muted-foreground",
      )}
    >
      {estConfiance ? t("badgeTrusted") : t("badgeVerified")}
    </span>
  );
}
