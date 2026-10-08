import type { RoomBlock } from "../api/schemas";

const JOUR_MS = 24 * 60 * 60 * 1000;
// Rétrocession proche avec des places invendues : l'agence doit agir.
export const ALERTE_RETROCESSION_JOURS = 14;

export function placesInvendues(bloc: RoomBlock): number {
  return bloc.totalBeds - bloc.assignedBeds;
}

/** Date de rétrocession à moins de 14 jours (ou passée) avec des places invendues. */
export function retrocessionProche(
  bloc: RoomBlock,
  maintenant: Date = new Date(),
): boolean {
  return (
    bloc.releaseDate !== undefined &&
    placesInvendues(bloc) > 0 &&
    new Date(bloc.releaseDate).getTime() - maintenant.getTime() <
      ALERTE_RETROCESSION_JOURS * JOUR_MS
  );
}
