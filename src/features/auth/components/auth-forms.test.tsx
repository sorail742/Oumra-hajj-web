import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { AgencyLoginForm } from "./AgencyLoginForm";
import { OtpLoginFlow } from "./OtpLoginFlow";
import { RegisterAgencyForm } from "./RegisterAgencyForm";

const routeur = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => routeur }));

const fetchMock = vi.fn();

function saisir(libelle: RegExp, valeur: string) {
  fireEvent.change(screen.getByLabelText(libelle), {
    target: { value: valeur },
  });
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("OtpLoginFlow", () => {
  it("normalise le numéro guinéen, envoie le code puis ouvre la session", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json({ sent: true }))
      .mockResolvedValueOnce(Response.json({ role: "pilgrim" }));

    afficherAvecProviders(<OtpLoginFlow next="/bookings" />);
    saisir(/numéro de téléphone/i, "620 00 00 00");
    fireEvent.click(screen.getByRole("button", { name: /recevoir mon code/i }));

    expect(
      await screen.findByLabelText(/code reçu par sms/i),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      "/api/auth/otp/request",
      expect.objectContaining({
        body: JSON.stringify({ phone: "+224620000000" }),
      }),
    );

    saisir(/code reçu par sms/i, "123456");
    fireEvent.click(screen.getByRole("button", { name: /valider/i }));

    await waitFor(() =>
      expect(routeur.replace).toHaveBeenCalledWith("/bookings"),
    );
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      "/api/session/otp",
      expect.objectContaining({
        body: JSON.stringify({ phone: "+224620000000", code: "123456" }),
      }),
    );
  });

  it("refuse un numéro invalide sans appeler l'API", () => {
    afficherAvecProviders(<OtpLoginFlow />);
    saisir(/numéro de téléphone/i, "123");
    fireEvent.click(screen.getByRole("button", { name: /recevoir mon code/i }));

    expect(screen.getByText(/saisissez un numéro valide/i)).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe("AgencyLoginForm", () => {
  it("affiche un message clair sur identifiants refusés, sans rediriger", async () => {
    fetchMock.mockResolvedValue(
      Response.json(
        { statusCode: 401, timestamp: "", path: "", message: "Unauthorized" },
        { status: 401 },
      ),
    );

    afficherAvecProviders(<AgencyLoginForm />);
    saisir(/adresse e-mail/i, "agence@exemple.test");
    saisir(/^mot de passe$/i, "mauvais-mot");
    fireEvent.click(screen.getByRole("button", { name: /se connecter/i }));

    expect(
      await screen.findByText(/e-mail ou mot de passe incorrect/i),
    ).toBeInTheDocument();
    expect(routeur.replace).not.toHaveBeenCalled();
  });
});

describe("RegisterAgencyForm", () => {
  it("bloque l'envoi si les deux mots de passe diffèrent", async () => {
    afficherAvecProviders(<RegisterAgencyForm />);
    saisir(/raison sociale/i, "Agence Factice");
    saisir(/e-mail de connexion/i, "agence@exemple.test");
    saisir(/téléphone de l'agence/i, "620000000");
    saisir(/^mot de passe$/i, "motdepasse-1");
    saisir(/confirmer le mot de passe/i, "motdepasse-2");
    fireEvent.click(
      screen.getByRole("button", { name: /créer mon compte agence/i }),
    );

    expect(
      await screen.findByText(/ne correspondent pas/i),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
