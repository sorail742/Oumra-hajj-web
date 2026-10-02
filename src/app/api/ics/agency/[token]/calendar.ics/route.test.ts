import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import type { NextRequest } from "next/server";
import { GET } from "./route";

const JETON = "a".repeat(48);
const requete = {} as NextRequest;
const contexte = (token: string) => ({ params: Promise.resolve({ token }) });

describe("relais public ICS", () => {
  const fetchMock = vi.fn();

  beforeEach(() => {
    vi.stubEnv("BACKEND_URL", "http://backend.test");
    vi.stubGlobal("fetch", fetchMock);
  });

  afterEach(() => {
    fetchMock.mockReset();
    vi.unstubAllEnvs();
    vi.unstubAllGlobals();
  });

  it("relaie le flux du backend sans aucun en-tête d'authentification", async () => {
    fetchMock.mockResolvedValue(
      new Response("BEGIN:VCALENDAR\r\nEND:VCALENDAR", { status: 200 }),
    );

    const reponse = await GET(requete, contexte(JETON));

    expect(fetchMock).toHaveBeenCalledWith(
      `http://backend.test/api/v1/calendar/agency/${JETON}/calendar.ics`,
      { cache: "no-store" },
    );
    expect(reponse.status).toBe(200);
    expect(reponse.headers.get("Content-Type")).toContain("text/calendar");
    expect(await reponse.text()).toContain("BEGIN:VCALENDAR");
  });

  it("refuse un jeton mal formé sans appeler le backend", async () => {
    const reponse = await GET(requete, contexte("../../users"));
    expect(reponse.status).toBe(404);
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("renvoie 404 pour un jeton révoqué, sans relayer le corps d'erreur", async () => {
    fetchMock.mockResolvedValue(
      new Response('{"statusCode":404}', { status: 404 }),
    );
    const reponse = await GET(requete, contexte(JETON));
    expect(reponse.status).toBe(404);
    expect(await reponse.text()).toBe("");
  });
});
