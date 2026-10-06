import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";
import { CalendarSubscriptionCard } from "./CalendarSubscriptionCard";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Jetons explicitement factices. */
const ANCIEN = "a".repeat(48);
const NOUVEAU = "b".repeat(48);
const fetchMock = vi.fn();

function abonnement(token: string) {
  return Response.json({
    token,
    subscriptionUrl: `/api/v1/calendar/agency/${token}/calendar.ics`,
  });
}

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("CalendarSubscriptionCard", () => {
  it("affiche une URL absolue sur l'origine de l'application", async () => {
    fetchMock.mockResolvedValueOnce(abonnement(ANCIEN));
    afficherAvecProviders(
      <RoleProvider role="agency">
        <CalendarSubscriptionCard />
      </RoleProvider>,
    );

    expect(
      await screen.findByText(
        `${globalThis.location.origin}/api/ics/agency/${ANCIEN}/calendar.ics`,
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Copier le lien" }),
    ).toBeInTheDocument();
  });

  it("ne régénère qu'après confirmation, puis affiche le nouveau lien", async () => {
    fetchMock
      .mockResolvedValueOnce(abonnement(ANCIEN))
      .mockResolvedValueOnce(abonnement(NOUVEAU));
    afficherAvecProviders(
      <RoleProvider role="agency">
        <CalendarSubscriptionCard />
      </RoleProvider>,
    );

    fireEvent.click(
      await screen.findByRole("button", { name: "Régénérer le lien" }),
    );
    expect(fetchMock).toHaveBeenCalledTimes(1);

    fireEvent.click(screen.getByRole("button", { name: "Régénérer" }));
    expect(
      await screen.findByText(new RegExp(`${NOUVEAU}/calendar\\.ics$`)),
    ).toBeInTheDocument();
    await waitFor(() =>
      expect(fetchMock).toHaveBeenLastCalledWith(
        "/api/agencies/me/calendar-subscription/regenerate",
        expect.objectContaining({ method: "POST" }),
      ),
    );
  });
});
