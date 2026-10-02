import { describe, expect, it, vi } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NextIntlClientProvider } from "next-intl";
import { FileDropzone, TAILLE_MAX_DOCUMENT_OCTETS } from "./FileDropzone";
import messages from "@/messages/fr.json";

function fichier(nom: string, type: string, taille = 1024): File {
  const f = new File(["x"], nom, { type });
  Object.defineProperty(f, "size", { value: taille });
  return f;
}

function afficher(props: Partial<Parameters<typeof FileDropzone>[0]> = {}) {
  const onSubmit = vi.fn();
  render(
    <NextIntlClientProvider locale="fr" messages={messages}>
      <FileDropzone onSubmit={onSubmit} {...props} />
    </NextIntlClientProvider>,
  );
  return {
    onSubmit,
    input: screen.getByTestId("file-dropzone-input") as HTMLInputElement,
  };
}

describe("FileDropzone", () => {
  it("accepte un PDF valide, affiche nom et taille, et l'envoie au clic", async () => {
    const utilisateur = userEvent.setup();
    const { onSubmit, input } = afficher();
    const passeport = fichier("passeport-factice.pdf", "application/pdf", 2048);

    await utilisateur.upload(input, passeport);

    expect(
      await screen.findByText("passeport-factice.pdf"),
    ).toBeInTheDocument();
    expect(screen.getByText("2 Ko")).toBeInTheDocument();
    await utilisateur.click(screen.getByRole("button", { name: "Envoyer" }));
    expect(onSubmit).toHaveBeenCalledWith(passeport);
  });

  it("refuse un fichier de plus de 10 Mo avant tout envoi", async () => {
    const utilisateur = userEvent.setup();
    const { onSubmit, input } = afficher();

    await utilisateur.upload(
      input,
      fichier(
        "trop-gros.pdf",
        "application/pdf",
        TAILLE_MAX_DOCUMENT_OCTETS + 1,
      ),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent("10 Mo");
    expect(screen.getByRole("button", { name: "Envoyer" })).toBeDisabled();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("refuse un format non accepté", async () => {
    const utilisateur = userEvent.setup({ applyAccept: false });
    const { input } = afficher();

    await utilisateur.upload(
      input,
      fichier("script.exe", "application/x-msdownload"),
    );

    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Format non accepté",
    );
  });

  it("n'affiche aucun aperçu du contenu (règle 14) : ni image ni URL blob", async () => {
    const creerUrl = vi.fn();
    vi.stubGlobal("URL", Object.assign(URL, { createObjectURL: creerUrl }));
    const utilisateur = userEvent.setup();
    const { input } = afficher();

    await utilisateur.upload(input, fichier("photo-factice.png", "image/png"));

    await screen.findByText("photo-factice.png");
    expect(screen.queryByRole("img")).toBeNull();
    expect(creerUrl).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it("permet de retirer le fichier choisi", async () => {
    const utilisateur = userEvent.setup();
    const { input } = afficher();

    await utilisateur.upload(input, fichier("visa-factice.jpg", "image/jpeg"));
    await utilisateur.click(
      await screen.findByRole("button", { name: "Retirer le fichier" }),
    );

    await waitFor(() =>
      expect(screen.queryByText("visa-factice.jpg")).toBeNull(),
    );
  });

  it("affiche l'erreur d'envoi fournie par l'écran et bloque pendant l'envoi", () => {
    afficher({ error: "Le serveur a refusé le document.", isPending: true });

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Le serveur a refusé le document.",
    );
    expect(
      screen.getByRole("button", { name: "Envoi en cours…" }),
    ).toBeDisabled();
  });

  it("est atteignable au clavier", async () => {
    const utilisateur = userEvent.setup();
    afficher();

    await utilisateur.tab();

    expect(
      screen.getByRole("presentation", { name: "Zone de dépôt de document" }),
    ).toHaveFocus();
  });
});
