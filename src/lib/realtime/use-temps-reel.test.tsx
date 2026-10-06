import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { act, renderHook, waitFor } from "@testing-library/react";

/** Faux client Socket.IO : enregistre les écouteurs et les émissions. */
const ecouteurs = new Map<string, (...args: unknown[]) => void>();
const faux = {
  on: vi.fn((evt: string, f: (...args: unknown[]) => void) => {
    ecouteurs.set(evt, f);
  }),
  emit: vi.fn(),
  close: vi.fn(),
  connect: vi.fn(),
};
const ioMock = vi.fn((..._args: unknown[]) => faux);
vi.mock("socket.io-client", () => ({ io: (...a: unknown[]) => ioMock(...a) }));

const post = vi.fn();
vi.mock("@/lib/api/client", () => ({
  api: { post: (...a: unknown[]) => post(...a) },
}));

async function chargerHook() {
  vi.resetModules();
  return (await import("./use-temps-reel")).useTempsReel;
}

beforeEach(() => {
  ecouteurs.clear();
  vi.clearAllMocks();
});
afterEach(() => vi.unstubAllEnvs());

describe("useTempsReel", () => {
  it("reste au sondage sans URL temps réel configurée", async () => {
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "");
    const useTempsReel = await chargerHook();
    const { result } = renderHook(() =>
      useTempsReel({
        namespace: "community",
        rejoindre: { evenement: "community:join", id: "g1" },
        evenement: "community:new",
        onEvenement: vi.fn(),
      }),
    );
    expect(ioMock).not.toHaveBeenCalled();
    expect(result.current.connecte).toBe(false);
  });

  it("présente un ticket du proxy, rejoint la room et relaie l'évènement", async () => {
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "https://api.example.test/");
    post.mockResolvedValue({ ticket: "ticket-factice" });
    const onEvenement = vi.fn();
    const useTempsReel = await chargerHook();
    const { result, unmount } = renderHook(() =>
      useTempsReel({
        namespace: "community",
        rejoindre: { evenement: "community:join", id: "g1" },
        evenement: "community:new",
        onEvenement,
      }),
    );

    const [url, options] = ioMock.mock.calls[0] as [
      string,
      { transports: string[]; auth: (cb: (d: object) => void) => void },
    ];
    expect(url).toBe("https://api.example.test/community");
    expect(options.transports).toEqual(["websocket"]);

    const cb = vi.fn();
    options.auth(cb);
    await waitFor(() =>
      expect(cb).toHaveBeenCalledWith({ ticket: "ticket-factice" }),
    );
    expect(post).toHaveBeenCalledWith("/api/auth/realtime-ticket");

    act(() => ecouteurs.get("connect")?.());
    expect(result.current.connecte).toBe(true);
    expect(faux.emit).toHaveBeenCalledWith("community:join", "g1");

    act(() => ecouteurs.get("community:new")?.());
    expect(onEvenement).toHaveBeenCalledTimes(1);

    unmount();
    expect(faux.close).toHaveBeenCalled();
  });

  it("abandonne après des refus répétés du serveur", async () => {
    vi.useFakeTimers();
    vi.stubEnv("NEXT_PUBLIC_REALTIME_URL", "https://api.example.test");
    const useTempsReel = await chargerHook();
    renderHook(() =>
      useTempsReel({
        namespace: "messaging",
        rejoindre: { evenement: "conversation:join", id: "c1" },
        evenement: "message:new",
        onEvenement: vi.fn(),
      }),
    );

    for (let i = 0; i < 5; i += 1) {
      act(() => {
        ecouteurs.get("connect")?.();
        ecouteurs.get("disconnect")?.("io server disconnect");
        vi.advanceTimersByTime(2_000);
      });
    }
    expect(faux.connect).toHaveBeenCalledTimes(2);
    vi.useRealTimers();
  });
});
