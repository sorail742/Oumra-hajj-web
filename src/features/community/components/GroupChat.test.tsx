import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { GroupChat } from "./GroupChat";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

const toastErreur = vi.fn();
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: (...a: unknown[]) => toastErreur(...a) },
}));

/** Messages explicitement factices. */
function message(id: string, senderId: string, nom: string, content: string) {
  return {
    id,
    groupId: "g1",
    senderId,
    senderName: nom,
    content,
    clientSentAt: "2026-10-06T10:00:00Z",
    createdAt: "2026-10-06T10:00:00Z",
  };
}
const fetchMock = vi.fn();
beforeEach(() => {
  vi.stubGlobal("fetch", fetchMock);
  Element.prototype.scrollIntoView = vi.fn();
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  toastErreur.mockReset();
});

function afficher() {
  return afficherAvecProviders(
    <RoleProvider role="pilgrim" userId="moi">
      <GroupChat groupId="g1" />
    </RoleProvider>,
  );
}

describe("GroupChat", () => {
  it("affiche le nom des autres participants, pas le mien", async () => {
    fetchMock.mockResolvedValue(
      Response.json([
        message("m1", "autre", "Pèlerin Fictif", "Bonjour à tous"),
        message("m2", "moi", "Moi Fictif", "Salut"),
      ]),
    );
    afficher();

    expect(await screen.findByText("Bonjour à tous")).toBeInTheDocument();
    expect(screen.getByText("Pèlerin Fictif")).toBeInTheDocument();
    expect(screen.queryByText("Moi Fictif")).not.toBeInTheDocument();
  });

  it("envoie le message au groupe", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === "POST"
          ? Response.json(message("m3", "moi", "Moi", "Question factice"))
          : Response.json([]),
      ),
    );
    afficher();

    const champ = await screen.findByLabelText("Écrire un message…");
    fireEvent.change(champ, { target: { value: "  Question factice " } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => {
      const envoi = fetchMock.mock.calls.find(
        ([, init]) => (init as RequestInit | undefined)?.method === "POST",
      );
      expect(envoi?.[0]).toBe("/api/community/groups/g1/messages");
      expect(String((envoi?.[1] as RequestInit).body)).toContain(
        '"content":"Question factice"',
      );
    });
  });

  it("garde le texte saisi si l'envoi échoue", async () => {
    fetchMock.mockImplementation((_url: string, init?: RequestInit) =>
      Promise.resolve(
        init?.method === "POST"
          ? Response.json(
              { statusCode: 500, timestamp: "", path: "", message: "Erreur" },
              { status: 500 },
            )
          : Response.json([]),
      ),
    );
    afficher();

    const champ = await screen.findByLabelText("Écrire un message…");
    fireEvent.change(champ, { target: { value: "Message factice" } });
    fireEvent.click(screen.getByRole("button", { name: "Envoyer" }));

    await waitFor(() => expect(toastErreur).toHaveBeenCalled());
    expect(champ).toHaveValue("Message factice");
  });
});
