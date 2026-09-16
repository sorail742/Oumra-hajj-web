import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { BookingStepTracker } from "./BookingStepTracker";
import messages from "@/messages/fr.json";
import type { DossierStep } from "../api/schemas";

function afficher(steps: DossierStep[]) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <BookingStepTracker steps={steps} />
    </NextIntlClientProvider>,
  );
}

describe("BookingStepTracker", () => {
  it("affiche les cinq étapes dans un ordre fixe, même si l'API en renvoie moins", () => {
    afficher([{ key: "payment", status: "done" }]);
    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(5);
    expect(items[0]).toHaveTextContent("Paiement");
    expect(items[4]).toHaveTextContent("Documents");
  });

  it("traite une étape absente de l'API comme « à faire », pas comme une erreur", () => {
    afficher([{ key: "payment", status: "done" }]);
    const visa = screen.getByText("Visa").closest("li");
    expect(visa).not.toBeNull();
    expect(visa).not.toHaveTextContent(/\d{2}\/\d{2}\/\d{4}/);
  });

  it("affiche la date d'une étape terminée", () => {
    afficher([
      { key: "payment", status: "done", completedAt: "2026-01-15T10:00:00Z" },
    ]);
    expect(screen.getByText("15/01/2026")).toBeInTheDocument();
  });
});
