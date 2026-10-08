import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { AuditLogScreen } from "./AuditLogScreen";

const routeur = { replace: vi.fn() };
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => new URLSearchParams("action=payment.refund"),
}));

const fetchMock = vi.fn();

beforeEach(() => {
  fetchMock.mockResolvedValue(
    Response.json([
      {
        id: "e1",
        actorId: "u1",
        actorName: "Admin Factice",
        actorRole: "admin",
        action: "payment.refund",
        entityType: "payment",
        entityId: "pay-1",
        metadata: { refundedAmount: 500, currency: "GNF" },
        createdAt: "2026-10-08T10:00:00.000Z",
      },
    ]),
  );
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

describe("AuditLogScreen (idée #85)", () => {
  it("filtre par action depuis l'URL et propose l'export avec les mêmes filtres", async () => {
    afficherAvecProviders(<AuditLogScreen />);

    expect(
      (await screen.findAllByText("refundedAmount : 500 · currency : GNF"))
        .length,
    ).toBeGreaterThan(0);
    expect(fetchMock.mock.calls[0]?.[0]).toBe(
      "/api/admin/audit?action=payment.refund",
    );
    expect(
      screen.getByRole("link", { name: /Exporter en CSV/ }),
    ).toHaveAttribute("href", "/api/admin/audit/csv?action=payment.refund");
  });
});
