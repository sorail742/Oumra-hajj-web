import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { NextIntlClientProvider } from "next-intl";
import { ConversationView } from "./ConversationView";
import messages from "@/messages/fr.json";

vi.mock("@/lib/auth/role-context", () => ({
  useUserId: () => "user-moi",
}));

const useConversation = vi.fn();
const useMessages = vi.fn();
const useSendMessage = vi.fn();
vi.mock("../api/use-messaging", () => ({
  useConversation: (...args: unknown[]) => useConversation(...args),
  useMessages: (...args: unknown[]) => useMessages(...args),
  useSendMessage: (...args: unknown[]) => useSendMessage(...args),
}));

function afficher() {
  useConversation.mockReturnValue({ data: { id: "conv-1" } });
  useSendMessage.mockReturnValue({ mutateAsync: vi.fn(), isPending: false });

  return render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <ConversationView bookingId="b1" channel="agency" />
    </NextIntlClientProvider>,
  );
}

describe("ConversationView", () => {
  /**
   * Sans `userId` connu (JWT non décodable), aucun message ne doit être
   * présenté comme « le mien » — voir `lib/auth/jwt.ts` : un champ mal
   * décodé ne doit jamais fabriquer une certitude qui n'existe pas.
   */
  it("aligne à droite les messages envoyés par l'utilisateur courant, à gauche les autres", () => {
    useMessages.mockReturnValue({
      data: [
        {
          id: "m1",
          senderId: "user-moi",
          content: "Bonjour",
          createdAt: "2026-01-01T10:00:00Z",
        },
        {
          id: "m2",
          senderId: "user-agence",
          content: "Bonsoir",
          createdAt: "2026-01-01T10:01:00Z",
        },
      ],
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });

    afficher();

    const monMessage = screen.getByText("Bonjour").closest(".flex");
    const leurMessage = screen.getByText("Bonsoir").closest(".flex");
    expect(monMessage).toHaveClass("justify-end");
    expect(leurMessage).toHaveClass("justify-start");
  });
});
