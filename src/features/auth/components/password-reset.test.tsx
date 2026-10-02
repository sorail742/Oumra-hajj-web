import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { ForgotPasswordForm } from "./ForgotPasswordForm";
import { ResetPasswordForm } from "./ResetPasswordForm";

const routeur = { replace: vi.fn(), push: vi.fn(), refresh: vi.fn() };
vi.mock("next/navigation", () => ({ useRouter: () => routeur }));

const fetchMock = vi.fn();
/** Jeton explicitement factice, à la longueur attendue (43). */
const JETON = "j".repeat(43);

function saisir(libelle: RegExp, valeur: string) {
  fireEvent.change(screen.getByLabelText(libelle), {
    target: { value: valeur },
  });
}

function erreur(statusCode: number) {
  return Response.json(
    { statusCode, timestamp: "", path: "", message: "Erreur" },
    { status: statusCode },
  );
}

beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
});

afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
  globalThis.history.replaceState(null, "", "/");
});

describe("ForgotPasswordForm", () => {
  it("envoie l'adresse normalisée et confirme sans révéler l'existence du compte", async () => {
    fetchMock.mockResolvedValue(Response.json({ sent: true }));
    afficherAvecProviders(<ForgotPasswordForm />);

    saisir(/adresse e-mail/i, " Agence@Exemple.TEST ");
    fireEvent.click(screen.getByRole("button", { name: /recevoir le lien/i }));

    expect(
      await screen.findByText(
        /Si un compte agence ou admin correspond à agence@exemple.test/,
      ),
    ).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/password/forgot",
      expect.objectContaining({
        body: JSON.stringify({ email: "agence@exemple.test" }),
      }),
    );
  });

  it("signale une réinitialisation indisponible (503)", async () => {
    fetchMock.mockResolvedValue(erreur(503));
    afficherAvecProviders(<ForgotPasswordForm />);

    saisir(/adresse e-mail/i, "agence@exemple.test");
    fireEvent.click(screen.getByRole("button", { name: /recevoir le lien/i }));

    expect(
      await screen.findByText(/momentanément indisponible/),
    ).toBeInTheDocument();
  });
});

describe("ResetPasswordForm", () => {
  it("lit le jeton dans le fragment et envoie le nouveau mot de passe", async () => {
    globalThis.history.replaceState(null, "", `/reset-password#token=${JETON}`);
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    afficherAvecProviders(<ResetPasswordForm />);

    saisir(/^nouveau mot de passe/i, "mot-de-passe-factice");
    saisir(/confirmer/i, "mot-de-passe-factice");
    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

    await waitFor(() =>
      expect(routeur.replace).toHaveBeenCalledWith("/login?reset=1"),
    );
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/auth/password/reset",
      expect.objectContaining({
        body: JSON.stringify({
          token: JETON,
          newPassword: "mot-de-passe-factice",
        }),
      }),
    );
  });

  it("refuse deux mots de passe différents sans appeler le backend", async () => {
    globalThis.history.replaceState(null, "", `/reset-password#token=${JETON}`);
    afficherAvecProviders(<ResetPasswordForm />);

    saisir(/^nouveau mot de passe/i, "mot-de-passe-factice");
    saisir(/confirmer/i, "autre-mot-de-passe");
    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(
      await screen.findByText("Les deux mots de passe ne correspondent pas."),
    ).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("propose un nouveau lien quand le jeton est refusé (400)", async () => {
    globalThis.history.replaceState(null, "", `/reset-password#token=${JETON}`);
    fetchMock.mockResolvedValue(erreur(400));
    afficherAvecProviders(<ResetPasswordForm />);

    saisir(/^nouveau mot de passe/i, "mot-de-passe-factice");
    saisir(/confirmer/i, "mot-de-passe-factice");
    fireEvent.click(screen.getByRole("button", { name: /enregistrer/i }));

    expect(await screen.findByText(/déjà servi/)).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /demander un nouveau lien/i }),
    ).toHaveAttribute("href", "/forgot-password");
  });

  it("explique un lien incomplet (sans jeton)", () => {
    globalThis.history.replaceState(null, "", "/reset-password");
    afficherAvecProviders(<ResetPasswordForm />);

    expect(screen.getByText(/lien est incomplet/)).toBeInTheDocument();
  });
});
