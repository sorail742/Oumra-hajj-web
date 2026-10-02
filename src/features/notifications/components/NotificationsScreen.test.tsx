import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { NotificationBell } from "@/components/layout/NotificationBell";
import { NotificationsScreen } from "./NotificationsScreen";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "pilgrim" }));
const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Notifications factices. */
const nonLues = [
  {
    id: "n1",
    recipientId: "u1",
    type: "sos",
    title: "Alerte SOS de votre groupe (factice)",
    content: "Un pèlerin de votre groupe a déclenché une alerte.",
    isCritical: true,
    createdAt: "2026-10-02T08:00:00.000Z",
  },
  {
    id: "n2",
    recipientId: "u1",
    type: "payment",
    title: "Paiement confirmé (factice)",
    content: "Votre première tranche est enregistrée.",
    isCritical: false,
    createdAt: "2026-10-01T08:00:00.000Z",
  },
];

beforeEach(() => {
  recherche = new URLSearchParams();
  fetchMock.mockImplementation((_url: string, init?: RequestInit) => {
    if (init?.method === "PATCH") {
      return Promise.resolve(
        Response.json({ ...nonLues[1], readAt: "2026-10-02T09:00:00.000Z" }),
      );
    }
    return Promise.resolve(Response.json(nonLues));
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("NotificationsScreen (ticket #68)", () => {
  it("liste les non lues par défaut et signale une alerte critique par un libellé", async () => {
    afficherAvecProviders(<NotificationsScreen />);

    const sos = (
      await screen.findByText("Alerte SOS de votre groupe (factice)")
    ).closest("li") as HTMLElement;
    expect(within(sos).getByText("Important")).toBeInTheDocument();
    expect(fetchMock).toHaveBeenCalledWith(
      "/api/notifications?unreadOnly=true",
      expect.anything(),
    );
  });

  it("marque une notification comme lue", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<NotificationsScreen />);

    const paiement = (
      await screen.findByText("Paiement confirmé (factice)")
    ).closest("li") as HTMLElement;
    await utilisateur.click(
      within(paiement).getByRole("button", { name: "Marquer comme lue" }),
    );

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/notifications/n2/read",
        expect.objectContaining({ method: "PATCH" }),
      ),
    );
  });

  it("garde le filtre dans l'URL", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<NotificationsScreen />);

    await utilisateur.click(screen.getByRole("button", { name: "Toutes" }));
    expect(routeur.replace).toHaveBeenCalledWith("?filtre=toutes", {
      scroll: false,
    });
  });
});

describe("NotificationBell", () => {
  it("annonce le nombre de non lues dans son nom accessible", async () => {
    afficherAvecProviders(<NotificationBell />);

    expect(
      await screen.findByRole("link", { name: "Notifications, 2 non lues" }),
    ).toHaveAttribute("href", "/notifications");
  });
});
