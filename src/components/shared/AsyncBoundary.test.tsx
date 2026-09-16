import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { AsyncBoundary } from "./AsyncBoundary";
import messages from "@/messages/fr.json";

/**
 * Les quatre états (`docs/testing.md`) : chargement, vide, erreur, nominal —
 * `ErrorState`/`EmptyState` utilisent `useTranslations`, d'où le
 * `NextIntlClientProvider` autour de chaque rendu.
 */
function avecIntl(enfant: ReactNode) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      {enfant}
    </NextIntlClientProvider>,
  );
}

describe("AsyncBoundary", () => {
  it("affiche le squelette pendant le chargement", () => {
    avecIntl(
      <AsyncBoundary
        query={{
          data: undefined,
          isPending: true,
          isError: false,
          refetch: vi.fn(),
        }}
        skeleton={<div>Squelette</div>}
      >
        {() => <div>Contenu</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByText("Squelette")).toBeInTheDocument();
  });

  it("affiche l'état vide quand les données sont un tableau vide", () => {
    avecIntl(
      <AsyncBoundary
        query={{ data: [], isPending: false, isError: false, refetch: vi.fn() }}
        skeleton={<div />}
        empty={<div>Vide</div>}
      >
        {() => <div>Contenu</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByText("Vide")).toBeInTheDocument();
  });

  it("affiche l'état d'erreur et déclenche refetch au clic sur Réessayer", () => {
    const refetch = vi.fn();
    avecIntl(
      <AsyncBoundary
        query={{ data: undefined, isPending: false, isError: true, refetch }}
        skeleton={<div />}
      >
        {() => <div>Contenu</div>}
      </AsyncBoundary>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(refetch).toHaveBeenCalledOnce();
  });

  it("affiche le contenu nominal quand des données existent", () => {
    avecIntl(
      <AsyncBoundary
        query={{
          data: [{ id: "1" }],
          isPending: false,
          isError: false,
          refetch: vi.fn(),
        }}
        skeleton={<div />}
      >
        {(data) => <div>{data.length} élément(s)</div>}
      </AsyncBoundary>,
    );
    expect(screen.getByText("1 élément(s)")).toBeInTheDocument();
  });
});
