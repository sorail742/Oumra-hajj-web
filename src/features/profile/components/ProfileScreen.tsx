"use client";

import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { useCurrentUser } from "@/lib/auth/use-current-user";
import { ProfileForm } from "./ProfileForm";

/** Charge `GET /users/me` puis affiche le formulaire (quatre états, règle 6). */
export function ProfileScreen() {
  const query = useCurrentUser();
  return (
    <AsyncBoundary
      query={query}
      skeleton={
        <div className="max-w-(--content-form) space-y-6">
          <Skeleton className="h-56 rounded-xl" />
          <Skeleton className="h-48 rounded-xl" />
        </div>
      }
    >
      {(utilisateur) => (
        <ProfileForm key={utilisateur.id} utilisateur={utilisateur} />
      )}
    </AsyncBoundary>
  );
}
