import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import { SosButton } from "./SosButton";
import messages from "@/messages/fr.json";

/**
 * Le point non négociable, validé explicitement avec l'utilisateur : une
 * pression courte n'envoie jamais l'alerte, seule une pression maintenue
 * jusqu'au bout la déclenche.
 */
const post = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { post: (...args: unknown[]) => post(...args) },
}));
vi.mock("sonner", () => ({
  toast: { success: vi.fn(), error: vi.fn() },
}));

function afficher() {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        <SosButton groupId="g1" />
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}

describe("SosButton", () => {
  beforeEach(() => {
    post.mockReset();
    post.mockResolvedValue(undefined);
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("n'envoie pas l'alerte sur une pression courte relâchée avant le délai", async () => {
    afficher();
    const bouton = screen.getByRole("button");

    fireEvent.pointerDown(bouton);
    await act(() => vi.advanceTimersByTimeAsync(500));
    fireEvent.pointerUp(bouton);
    await act(() => vi.advanceTimersByTimeAsync(5000));

    expect(post).not.toHaveBeenCalled();
  });

  it("envoie l'alerte une seule fois après une pression maintenue jusqu'au bout", async () => {
    afficher();
    const bouton = screen.getByRole("button");

    fireEvent.pointerDown(bouton);
    await act(() => vi.advanceTimersByTimeAsync(2000));

    expect(post).toHaveBeenCalledTimes(1);
    expect(post).toHaveBeenCalledWith("/api/groups/g1/sos");
  });

  it("annule aussi sur pointerLeave (doigt qui glisse hors du bouton)", async () => {
    afficher();
    const bouton = screen.getByRole("button");

    fireEvent.pointerDown(bouton);
    await act(() => vi.advanceTimersByTimeAsync(500));
    fireEvent.pointerLeave(bouton);
    await act(() => vi.advanceTimersByTimeAsync(5000));

    expect(post).not.toHaveBeenCalled();
  });
});
