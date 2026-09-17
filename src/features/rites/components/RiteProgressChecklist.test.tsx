import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { RiteProgressChecklist } from "./RiteProgressChecklist";
import messages from "@/messages/fr.json";

vi.mock("@/lib/auth/role-context", () => ({
  useRole: () => "pilgrim" as const,
}));

const useMyRiteProgress = vi.fn();
const useRiteSheets = vi.fn();
vi.mock("../api/use-rites", () => ({
  useMyRiteProgress: () => useMyRiteProgress(),
  useRiteSheets: () => useRiteSheets(),
}));

function afficher() {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <RiteProgressChecklist />
    </NextIntlClientProvider>,
  );
}

describe("RiteProgressChecklist", () => {
  it("traite une progression sans fiche correspondante comme non validée, jamais validée par défaut", () => {
    useMyRiteProgress.mockReturnValue({
      data: [
        {
          id: "p1",
          riteKey: "cle-orpheline",
          completed: false,
          tawafCount: 2,
          saiCount: 0,
        },
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    // Fiche encore en modération, absente de la liste publique.
    useRiteSheets.mockReturnValue({ data: [] });

    afficher();

    expect(
      screen.getByText("Contenu à valider par une personne qualifiée"),
    ).toBeInTheDocument();
    expect(screen.getByText("cle-orpheline")).toBeInTheDocument();
  });

  it("n'affiche pas le bandeau quand la fiche correspondante est validée", () => {
    useMyRiteProgress.mockReturnValue({
      data: [
        {
          id: "p1",
          riteKey: "tawaf",
          completed: true,
          tawafCount: 7,
          saiCount: 0,
        },
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    useRiteSheets.mockReturnValue({
      data: [
        {
          id: "s1",
          key: "tawaf",
          title: "Tawaf",
          isValidated: true,
        },
      ],
    });

    afficher();

    expect(screen.getByText("Tawaf")).toBeInTheDocument();
    expect(
      screen.queryByText("Contenu à valider par une personne qualifiée"),
    ).not.toBeInTheDocument();
  });
});
