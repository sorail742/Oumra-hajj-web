import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ReligiousContentNotice } from "./ReligiousContentNotice";
import messages from "@/messages/fr.json";

/**
 * Incarnation directe de `CLAUDE.md` règle 13, non négociable : le bandeau
 * reste tant que `validated` n'est pas explicitement `true`, et
 * n'offre aucun moyen de le fermer.
 */
function afficher(validated: boolean) {
  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <ReligiousContentNotice validated={validated} />
    </NextIntlClientProvider>,
  );
}

describe("ReligiousContentNotice", () => {
  it("s'affiche tant que le contenu n'est pas validé", () => {
    afficher(false);
    expect(
      screen.getByText("Contenu à valider par une personne qualifiée"),
    ).toBeInTheDocument();
  });

  it("ne propose aucun moyen de la fermer", () => {
    afficher(false);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });

  it("disparaît une fois le contenu validé par le backend", () => {
    afficher(true);
    expect(
      screen.queryByText("Contenu à valider par une personne qualifiée"),
    ).not.toBeInTheDocument();
  });
});
