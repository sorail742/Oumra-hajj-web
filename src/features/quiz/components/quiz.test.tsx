import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor, within } from "@testing-library/react";
import { PendingQuestionsQueue } from "./PendingQuestionsQueue";
import { QuestionProposalForm } from "./QuestionProposalForm";
import { QuizRunner } from "./QuizRunner";
import { QuizStatsCard } from "./QuizStatsCard";
import { RoleProvider } from "@/lib/auth/role-context";
import { afficherAvecProviders } from "@/test/afficher-avec-providers";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

/** Contenus explicitement factices, sans valeur religieuse. */
const QUESTION = {
  id: "q1",
  riteSheetId: "fiche-1",
  question: "Question factice ?",
  options: ["Réponse A", "Réponse B"],
};
const fetchMock = vi.fn();

beforeEach(() => vi.stubGlobal("fetch", fetchMock));
afterEach(() => {
  fetchMock.mockReset();
  vi.unstubAllGlobals();
});

function corpsDe(appel: number) {
  const init = fetchMock.mock.calls[appel]?.[1] as RequestInit | undefined;
  return init?.body;
}

describe("QuizRunner", () => {
  it("corrige immédiatement avec l'explication, puis donne le score", async () => {
    fetchMock
      .mockResolvedValueOnce(Response.json([QUESTION]))
      .mockResolvedValueOnce(
        Response.json({
          id: "t1",
          questionId: "q1",
          selectedOption: 0,
          isCorrect: false,
          correctOption: 1,
          explanation: "Explication factice.",
        }),
      );
    afficherAvecProviders(<QuizRunner riteSheetId="fiche-1" />);

    const valider = await screen.findByRole("button", {
      name: "Valider ma réponse",
    });
    expect(valider).toBeDisabled();
    fireEvent.click(screen.getByRole("radio", { name: "Réponse A" }));
    fireEvent.click(valider);

    expect(
      await screen.findByText(/La bonne réponse : Réponse B/),
    ).toBeInTheDocument();
    expect(screen.getByText("Explication factice.")).toBeInTheDocument();
    expect(corpsDe(1)).toBe(JSON.stringify({ selectedOption: 0 }));

    fireEvent.click(screen.getByRole("button", { name: "Voir mon score" }));
    expect(
      screen.getByText("0 bonne(s) réponse(s) sur 1."),
    ).toBeInTheDocument();
  });

  it("annonce l'absence de question publiée", async () => {
    fetchMock.mockResolvedValueOnce(Response.json([]));
    afficherAvecProviders(<QuizRunner riteSheetId="fiche-1" />);
    expect(
      await screen.findByText("Pas encore de question pour cette fiche."),
    ).toBeInTheDocument();
  });
});

describe("QuizStatsCard", () => {
  it("calcule la réussite par fiche", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        totalAttempts: 3,
        correctAttempts: 2,
        scorePercentage: 66.67,
        attempts: [
          { id: "a", isCorrect: true, question: { riteSheetId: "fiche-1" } },
          { id: "b", isCorrect: false, question: { riteSheetId: "fiche-1" } },
          { id: "c", isCorrect: true, question: { riteSheetId: "fiche-2" } },
        ],
      }),
    );
    afficherAvecProviders(
      <RoleProvider role="pilgrim">
        <QuizStatsCard
          titres={
            new Map([
              ["fiche-1", "Fiche Un"],
              ["fiche-2", "Fiche Deux"],
            ])
          }
        />
      </RoleProvider>,
    );

    const ligne = (await screen.findByText("Fiche Un")).closest("li");
    expect(ligne).not.toBeNull();
    expect(
      within(ligne as HTMLElement).getByText(/1 \/ 2/),
    ).toBeInTheDocument();
  });
});

describe("QuestionProposalForm", () => {
  it("envoie la question avec la bonne réponse cochée", async () => {
    fetchMock.mockResolvedValueOnce(
      Response.json({
        ...QUESTION,
        correctOption: 1,
        explanation: null,
        isValidated: false,
        createdAt: "2026-10-06T10:00:00Z",
      }),
    );
    afficherAvecProviders(
      <QuestionProposalForm fiches={[{ id: "fiche-1", titre: "Fiche Un" }]} />,
    );

    expect(
      screen.getByText("Contenu à valider par une personne qualifiée"),
    ).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText("Fiche de rite"), {
      target: { value: "fiche-1" },
    });
    fireEvent.change(screen.getByLabelText("Question"), {
      target: { value: "Question factice ?" },
    });
    fireEvent.change(screen.getByLabelText("Réponse 1"), {
      target: { value: "Réponse A" },
    });
    fireEvent.change(screen.getByLabelText("Réponse 2"), {
      target: { value: "Réponse B" },
    });
    fireEvent.click(screen.getByLabelText("Réponse 2 est la bonne"));
    fireEvent.click(
      screen.getByRole("button", { name: "Proposer la question" }),
    );

    await waitFor(() => expect(fetchMock).toHaveBeenCalledTimes(1));
    expect(corpsDe(0)).toBe(
      JSON.stringify({
        riteSheetId: "fiche-1",
        question: "Question factice ?",
        options: ["Réponse A", "Réponse B"],
        correctOption: 1,
      }),
    );
  });
});

describe("PendingQuestionsQueue", () => {
  it("ne publie qu'après confirmation, avec l'avertissement de contenu", async () => {
    fetchMock
      .mockResolvedValueOnce(
        Response.json([
          {
            ...QUESTION,
            correctOption: 1,
            explanation: null,
            isValidated: false,
            createdAt: "2026-10-06T10:00:00Z",
          },
        ]),
      )
      .mockImplementation(() => Promise.resolve(Response.json([])));
    afficherAvecProviders(
      <RoleProvider role="admin">
        <PendingQuestionsQueue titres={new Map([["fiche-1", "Fiche Un"]])} />
      </RoleProvider>,
    );

    expect(await screen.findByText("Question factice ?")).toBeInTheDocument();
    expect(
      screen.getByText("Contenu à valider par une personne qualifiée"),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Publier" }));
    expect(fetchMock).toHaveBeenCalledTimes(1);
    const dialogue = await screen.findByRole("dialog");
    fireEvent.click(within(dialogue).getByRole("button", { name: "Publier" }));

    await waitFor(() =>
      expect(fetchMock.mock.calls[1]?.[0]).toBe(
        "/api/quiz/questions/q1/validate",
      ),
    );
  });
});
