import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";
import { MicroCourseDetailScreen } from "./MicroCourseDetailScreen";
import { MicroCoursesScreen } from "./MicroCoursesScreen";

const routeur = { replace: vi.fn() };
let recherche = new URLSearchParams();
vi.mock("next/navigation", () => ({
  useRouter: () => routeur,
  useSearchParams: () => recherche,
}));

const fetchMock = vi.fn();

/** Cours factices. */
const coursRite = {
  id: "c1",
  title: "Le tawaf pas à pas (factice)",
  description: "Présentation factice.",
  videoUrl: "https://exemple.test/videos/tawaf.mp4",
  durationSeconds: 245,
  order: 2,
  category: "rites",
};
const coursSante = {
  ...coursRite,
  id: "c2",
  title: "Vaccins avant le départ (factice)",
  category: "health",
  order: 1,
};

function afficher(role: Role | undefined, ui: React.ReactElement) {
  afficherAvecProviders(<RoleProvider role={role}>{ui}</RoleProvider>);
}

beforeEach(() => {
  recherche = new URLSearchParams();
  fetchMock.mockImplementation((url: string) => {
    if (url === "/api/micro-courses/progress/mine") {
      return Promise.resolve(
        Response.json([{ courseId: "c2", isCompleted: true }]),
      );
    }
    if (url === "/api/micro-courses/progress/sync") {
      return Promise.resolve(Response.json([]));
    }
    if (url === "/api/micro-courses/c1")
      return Promise.resolve(Response.json(coursRite));
    if (url === "/api/micro-courses/c2")
      return Promise.resolve(Response.json(coursSante));
    return Promise.resolve(Response.json([coursRite, coursSante]));
  });
  vi.stubGlobal("fetch", fetchMock);
});
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
  vi.clearAllMocks();
});

describe("Micro-cours (ticket #82)", () => {
  it("liste les cours dans l'ordre, avec durée et progression du pèlerin", async () => {
    afficher("pilgrim", <MicroCoursesScreen />);

    const titres = await screen.findAllByText(/\(factice\)$/);
    expect(titres.map((t) => t.textContent)).toEqual([
      "Vaccins avant le départ (factice)",
      "Le tawaf pas à pas (factice)",
    ]);
    expect(screen.getAllByText("4 min 05")).toHaveLength(2);
    expect(await screen.findByText("Terminé")).toBeInTheDocument();
  });

  it("filtre par catégorie via l'URL, sans compte", async () => {
    recherche = new URLSearchParams("category=rites");
    const utilisateur = userEvent.setup();
    afficher(undefined, <MicroCoursesScreen />);

    await waitFor(() =>
      expect(fetchMock).toHaveBeenCalledWith(
        "/api/micro-courses?category=rites",
        expect.anything(),
      ),
    );
    expect(fetchMock).not.toHaveBeenCalledWith(
      "/api/micro-courses/progress/mine",
      expect.anything(),
    );
    await utilisateur.click(screen.getByRole("button", { name: "Santé" }));
    expect(routeur.replace).toHaveBeenCalledWith("?category=health", {
      scroll: false,
    });
  });

  it("signale un cours de rites comme à valider et lit la vidéo", async () => {
    afficher(undefined, <MicroCourseDetailScreen id="c1" />);

    expect(
      await screen.findByRole("heading", {
        name: "Le tawaf pas à pas (factice)",
      }),
    ).toBeInTheDocument();
    expect(screen.getByText(/personne qualifiée/)).toBeInTheDocument();
    expect(document.querySelector("video")).toHaveAttribute(
      "src",
      coursRite.videoUrl,
    );
    expect(
      screen.queryByRole("button", { name: "Marquer comme terminé" }),
    ).toBeNull();
  });

  it("permet au pèlerin de marquer un cours terminé", async () => {
    const utilisateur = userEvent.setup();
    afficher("pilgrim", <MicroCourseDetailScreen id="c1" />);

    await utilisateur.click(
      await screen.findByRole("button", { name: "Marquer comme terminé" }),
    );

    await waitFor(() => {
      const appel = fetchMock.mock.calls.find(
        ([url]) => url === "/api/micro-courses/progress/sync",
      ) as [string, RequestInit];
      const corps = JSON.parse(String(appel[1].body)) as {
        items: { courseId: string; isCompleted: boolean }[];
      };
      expect(corps.items[0]).toMatchObject({
        courseId: "c1",
        isCompleted: true,
      });
    });
  });
});
