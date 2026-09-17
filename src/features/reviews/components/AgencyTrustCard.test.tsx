import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AgencyTrustCard } from "./AgencyTrustCard";
import messages from "@/messages/fr.json";
import type { AgencyTrustScore } from "../api/schemas";

/**
 * `score`/`reviewAverage` peuvent être `undefined` (agence neuve) — le
 * point que `docs/design-system.md` §7 interdit explicitement de fabriquer
 * en zéro, donc le point le plus important à couvrir ici.
 */
function afficher(trustScore: AgencyTrustScore) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <AgencyTrustCard trustScore={trustScore} />
    </NextIntlClientProvider>,
  );
}

describe("AgencyTrustCard", () => {
  it("affiche « agence neuve » plutôt qu'un score à zéro quand aucune donnée n'existe", () => {
    afficher({
      agencyId: "a1",
      score: undefined,
      reviewAverage: undefined,
      reviewCount: 0,
      completionRate: undefined,
      concludedBookingsCount: 0,
      badge: null,
    });
    expect(
      screen.getByText(/Agence nouvellement inscrite/),
    ).toBeInTheDocument();
    expect(screen.queryByText("0 / 100")).not.toBeInTheDocument();
  });

  it("affiche les valeurs réelles quand elles existent", () => {
    afficher({
      agencyId: "a1",
      score: 82,
      reviewAverage: 4.3,
      reviewCount: 12,
      completionRate: 0.9,
      concludedBookingsCount: 10,
      badge: "trusted",
    });
    expect(screen.getByText("82 / 100")).toBeInTheDocument();
    expect(screen.getByText("4.3 / 5")).toBeInTheDocument();
    expect(screen.getByText("Confiance")).toBeInTheDocument();
  });
});
