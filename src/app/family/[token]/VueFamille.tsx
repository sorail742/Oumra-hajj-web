"use client";

import { BookingStepTracker } from "@/features/bookings/components/BookingStepTracker";
import { FamilyViewScreen } from "@/features/family-view/components/FamilyViewScreen";

/** Compose la vue famille et la frise des étapes (règle 2 : rôle d'une page). */
export function VueFamille({ token }: Readonly<{ token: string }>) {
  return (
    <FamilyViewScreen
      token={token}
      etapes={(steps) => <BookingStepTracker steps={steps} />}
    />
  );
}
