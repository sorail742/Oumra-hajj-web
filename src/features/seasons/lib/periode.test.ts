import { describe, expect, it } from "vitest";
import { lirePeriode } from "./periode";

describe("lirePeriode (idée #65)", () => {
  it("couvre par défaut les trois dernières années", () => {
    expect(lirePeriode(new URLSearchParams(), 2026)).toEqual({
      fromYear: 2024,
      toYear: 2026,
    });
  });

  it("lit la période de l'URL", () => {
    expect(lirePeriode(new URLSearchParams("from=2020&to=2025"), 2026)).toEqual(
      { fromYear: 2020, toYear: 2025 },
    );
  });

  it("retombe sur les trois ans précédant la fin si la période est invalide", () => {
    expect(lirePeriode(new URLSearchParams("from=2026&to=2024"), 2026)).toEqual(
      { fromYear: 2022, toYear: 2024 },
    );
    expect(lirePeriode(new URLSearchParams("from=2000&to=2026"), 2026)).toEqual(
      { fromYear: 2024, toYear: 2026 },
    );
  });
});
