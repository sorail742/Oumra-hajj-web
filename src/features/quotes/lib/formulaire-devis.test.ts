import { describe, expect, it } from "vitest";
import {
  schemaDevis,
  versNouveauDevis,
  type ValeursDevis,
} from "./formulaire-devis";

const schema = schemaDevis({
  required: "requis",
  integerInvalid: "entier",
  amountInvalid: "montant",
  discountInvalid: "remise",
  phoneInvalid: "téléphone",
  emailInvalid: "email",
  dateInvalid: "date",
});

/** Devis explicitement factice (idée #49). */
const base: ValeursDevis = {
  packageId: "",
  clientName: "Mosquée fictive",
  clientType: "mosque",
  contactName: "Contact fictif",
  contactPhone: "",
  contactEmail: "",
  pilgrimsCount: "30",
  lines: [{ label: "Forfait", quantity: "30", unitPrice: "1000,50" }],
  discountPercent: "7,5",
  conditions: "",
  validUntil: "2026-11-30",
};

describe("formulaire de devis (idée #49)", () => {
  it("convertit la saisie sans calculer de total", () => {
    const devis = versNouveauDevis(schema.parse(base));
    expect(devis).toEqual({
      clientName: "Mosquée fictive",
      clientType: "mosque",
      contactName: "Contact fictif",
      pilgrimsCount: 30,
      lines: [{ label: "Forfait", quantity: 30, unitPrice: 1000.5 }],
      discountRate: 0.075,
      validUntil: "2026-11-30T23:59:59.000Z",
    });
    expect(devis).not.toHaveProperty("totalAmount");
  });

  it("garde le forfait et omet une remise nulle", () => {
    const devis = versNouveauDevis(
      schema.parse({ ...base, packageId: "forfait-1", discountPercent: "" }),
    );
    expect(devis.packageId).toBe("forfait-1");
    expect(devis).not.toHaveProperty("discountRate");
  });

  it("refuse une remise de plus de 50 % et un contact mal formé", () => {
    const erreurs = schema
      .safeParse({
        ...base,
        discountPercent: "60",
        contactPhone: "620000000",
        contactEmail: "pas-un-email",
      })
      .error?.issues.map((i) => i.message);
    expect(erreurs).toEqual(["téléphone", "email", "remise"]);
  });
});
