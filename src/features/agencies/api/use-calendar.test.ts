import { describe, expect, it } from "vitest";
import {
  calendarSubscriptionSchema,
  urlAbonnementCalendrier,
} from "./use-calendar";

const JETON = "0".repeat(48);

describe("abonnement calendrier", () => {
  it("accepte la forme réelle renvoyée par le backend (toCalendarSubscriptionShape)", () => {
    const resultat = calendarSubscriptionSchema.safeParse({
      token: JETON,
      subscriptionUrl: `/api/v1/calendar/agency/${JETON}/calendar.ics`,
    });
    expect(resultat.success).toBe(true);
  });

  it("rejette l'ancienne forme supposée { url }", () => {
    expect(
      calendarSubscriptionSchema.safeParse({ url: "https://x.test" }).success,
    ).toBe(false);
  });

  it("compose une URL absolue sur l'origine de l'application, jamais celle du backend", () => {
    expect(urlAbonnementCalendrier(JETON, "https://app.test")).toBe(
      `https://app.test/api/ics/agency/${JETON}/calendar.ics`,
    );
  });
});
