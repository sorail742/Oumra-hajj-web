import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { InitiatePaymentFlow } from "./InitiatePaymentFlow";
import { ApiError } from "@/lib/api/types";
import messages from "@/messages/fr.json";

const get = vi.fn();
const post = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: {
    get: (...args: unknown[]) => get(...args),
    post: (...args: unknown[]) => post(...args),
  },
}));

const BOOKING = "00000000-0000-4000-8000-000000000030";
/** Montant et référence factices, explicitement non réalistes. */
const MONTANT = 1234567;

function paiementFactice(status: "pending" | "succeeded" | "failed") {
  return {
    id: "00000000-0000-4000-8000-000000000031",
    bookingId: BOOKING,
    amount: MONTANT,
    currency: "GNF",
    installmentNumber: 2,
    method: "mobile_money_mtn",
    status,
    providerReference: "dev-reference-factice",
  };
}

function erreurApi(statusCode: number, message: string | string[]) {
  return new ApiError({
    statusCode,
    message,
    path: "/api/v1/payments/initiate",
    timestamp: "2026-10-01T00:00:00.000Z",
  });
}

function afficher() {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <InitiatePaymentFlow bookingId={BOOKING} />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

async function payer(
  utilisateur: ReturnType<typeof userEvent.setup>,
  montant: string,
) {
  await utilisateur.type(screen.getByLabelText("Montant (GNF)"), montant);
  await utilisateur.click(
    screen.getByRole("radio", { name: "Mobile Money MTN" }),
  );
  await utilisateur.click(screen.getByRole("button", { name: "Payer" }));
}

describe("InitiatePaymentFlow", () => {
  beforeEach(() => {
    get.mockReset();
    post.mockReset();
  });
  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  it.each(["0", "12,5", "abc"])(
    "refuse un montant invalide (%s) sans appeler le backend",
    async (montant) => {
      const utilisateur = userEvent.setup();
      afficher();

      await payer(utilisateur, montant);

      expect(
        await screen.findByText(
          "Saisissez un montant entier supérieur à zéro.",
        ),
      ).toBeInTheDocument();
      expect(post).not.toHaveBeenCalled();
    },
  );

  it("lance le paiement puis affiche la référence copiable et l'attente de confirmation", async () => {
    const utilisateur = userEvent.setup();
    post.mockResolvedValue(paiementFactice("pending"));
    get.mockResolvedValue(paiementFactice("pending"));
    afficher();

    await payer(utilisateur, String(MONTANT));

    expect(post).toHaveBeenCalledWith("/api/payments/initiate", {
      bookingId: BOOKING,
      amount: MONTANT,
      method: "mobile_money_mtn",
    });
    expect(await screen.findByText("dev-reference-factice")).toHaveClass(
      "font-mono",
    );
    expect(
      screen.getByRole("button", { name: "Copier la référence" }),
    ).toBeInTheDocument();
    expect(screen.getByText("En attente de confirmation")).toBeInTheDocument();
  });

  it("rafraîchit le statut jusqu'à la confirmation par le fournisseur", async () => {
    vi.useFakeTimers({ shouldAdvanceTime: true });
    const utilisateur = userEvent.setup({
      advanceTimers: vi.advanceTimersByTime,
    });
    post.mockResolvedValue(paiementFactice("pending"));
    get
      .mockResolvedValueOnce(paiementFactice("pending"))
      .mockResolvedValue(paiementFactice("succeeded"));
    afficher();

    await payer(utilisateur, String(MONTANT));
    await screen.findByText("En attente de confirmation");
    await vi.advanceTimersByTimeAsync(5_000);

    expect(await screen.findByText("Paiement confirmé")).toBeInTheDocument();
    expect(
      screen.getByText("La tranche n° 2 est enregistrée sur votre dossier."),
    ).toBeInTheDocument();
    const appels = get.mock.calls.length;
    await vi.advanceTimersByTimeAsync(20_000);
    expect(get.mock.calls.length).toBe(appels);
  });

  it("affiche un échec explicite et permet de réessayer", async () => {
    const utilisateur = userEvent.setup();
    post.mockResolvedValue(paiementFactice("pending"));
    get.mockResolvedValue(paiementFactice("failed"));
    afficher();

    await payer(utilisateur, String(MONTANT));
    expect(await screen.findByText("Paiement échoué")).toBeInTheDocument();

    await utilisateur.click(screen.getByRole("button", { name: "Réessayer" }));
    expect(screen.getByLabelText("Montant (GNF)")).toBeInTheDocument();
  });

  it.each([
    [403, "Cette réservation n'est pas à votre nom."],
    [404, "Réservation introuvable."],
    [500, "Le paiement n'a pas pu être lancé. Réessayez dans un instant."],
  ])(
    "choisit le message d'erreur d'après le statut HTTP %i, pas d'après le texte backend",
    async (statut, attendu) => {
      const utilisateur = userEvent.setup();
      post.mockRejectedValue(erreurApi(statut, "texte backend quelconque"));
      afficher();

      await payer(utilisateur, "1000");

      expect(await screen.findByRole("alert")).toHaveTextContent(attendu);
      expect(screen.queryByText("texte backend quelconque")).toBeNull();
    },
  );

  it("rattache une erreur de validation 400 au champ montant", async () => {
    const utilisateur = userEvent.setup();
    post.mockRejectedValue(
      erreurApi(400, ["amount must be a positive number"]),
    );
    afficher();

    await payer(utilisateur, "1000");

    expect(
      await screen.findByText("amount must be a positive number"),
    ).toBeInTheDocument();
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Les informations saisies ont été refusées.",
    );
  });

  it("ne journalise jamais le montant", async () => {
    const espions = (["log", "info", "warn", "error", "debug"] as const).map(
      (niveau) => vi.spyOn(console, niveau).mockImplementation(() => undefined),
    );
    const utilisateur = userEvent.setup();
    post.mockResolvedValue(paiementFactice("pending"));
    get.mockResolvedValue(paiementFactice("succeeded"));
    afficher();

    await payer(utilisateur, String(MONTANT));
    await screen.findByText("Paiement confirmé");

    for (const espion of espions) {
      for (const appel of espion.mock.calls) {
        expect(JSON.stringify(appel)).not.toContain(String(MONTANT));
      }
    }
  });
});
