"use client";

import { AgencyDirectoryScreen } from "@/features/directory/components/AgencyDirectoryScreen";
import { TrustScoreBadge } from "@/features/reviews/components/TrustScoreBadge";

/**
 * Compose l'annuaire et le badge de confiance du domaine avis (règle 2).
 * Fichier client : une fonction (`badge`) ne peut pas passer d'un Server
 * Component à un Client Component.
 */
export function AnnuaireAgences() {
  return (
    <AgencyDirectoryScreen
      badge={(agence) => <TrustScoreBadge badge={agence.trustScore.badge} />}
    />
  );
}
