import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { ChecklistPanel } from "./ChecklistPanel";

vi.mock("@/lib/auth/role-context", () => ({ useRole: () => "pilgrim" }));

const RESERVATION = "00000000-0000-4000-8000-000000000090";
const fetchMock = vi.fn();

/** Éléments factices de checklist. */
const elements = [
  {
    id: "c1",
    bookingId: RESERVATION,
    title: "Élément factice A",
    category: "document",
    isCompleted: true,
    reminderDate: null,
    reminderSent: false,
  },
  {
    id: "c2",
    bookingId: RESERVATION,
    title: "Élément factice B",
    category: "luggage",
    isCompleted: false,
    reminderDate: "2026-11-15T00:00:00.000Z",
  },
  {
    id: "c3",
    bookingId: RESERVATION,
    title: "Élément factice C",
    category: "categorie-inconnue",
    isCompleted: false,
  },
];

function repondre(url: string, init?: RequestInit) {
  if (url === `/api/checklist/bookings/${RESERVATION}`) {
    return Response.json(elements);
  }
  if (url === "/api/checklist/c2/status" && init?.method === "PATCH") {
    return Response.json({ ...elements[1], isCompleted: true });
  }
  return Response.json({}, { status: 404 });
}

beforeEach(() => {
  fetchMock.mockImplementation((url: string, init?: RequestInit) =>
    Promise.resolve(repondre(url, init)),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("ChecklistPanel", () => {
  it("regroupe les éléments par catégorie et affiche la progression", async () => {
    afficherAvecProviders(<ChecklistPanel bookingId={RESERVATION} />);

    expect(await screen.findByText("1 sur 3")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Documents" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 3, name: "Bagages" }),
    ).toBeInTheDocument();
    // Catégorie inconnue du front : repli sur « Autre ».
    expect(
      screen.getByRole("heading", { level: 3, name: "Autre" }),
    ).toBeInTheDocument();
    expect(screen.getByText(/^Rappel le/)).toBeInTheDocument();
  });

  it("coche un élément et met la progression à jour", async () => {
    const utilisateur = userEvent.setup();
    afficherAvecProviders(<ChecklistPanel bookingId={RESERVATION} />);

    await utilisateur.click(
      await screen.findByRole("checkbox", { name: /Élément factice B/ }),
    );

    expect(await screen.findByText("2 sur 3")).toBeInTheDocument();
    const appel = fetchMock.mock.calls.find(
      ([url]) => url === "/api/checklist/c2/status",
    ) as [string, RequestInit];
    expect(JSON.parse(String(appel[1].body))).toEqual({ isCompleted: true });
    await waitFor(() =>
      expect(
        screen.getByRole("checkbox", { name: /Élément factice B/ }),
      ).toBeChecked(),
    );
  });
});
