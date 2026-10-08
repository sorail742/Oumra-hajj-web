"use client";

import { useSearchParams } from "next/navigation";
import { CreateRoomBlockDialog } from "@/features/rooms/components/CreateRoomBlockDialog";
import { RoomBlocksScreen } from "@/features/rooms/components/RoomBlocksScreen";
import { useMyPackages } from "@/features/packages/api/use-my-packages";

/**
 * Compose deux domaines (forfaits de l'agence → allotement) : rôle d'un
 * fichier de page, jamais d'un `features/*` (règle 2).
 */
export function CreerBloc() {
  const params = useSearchParams();
  const { data: forfaits = [] } = useMyPackages();
  return (
    <CreateRoomBlockDialog
      forfaitInitial={params.get("package") ?? undefined}
      forfaits={forfaits.map((f) => ({
        id: f.id,
        title: f.title,
        etapes: f.stages.map((s) => ({
          id: s.id,
          libelle: `${s.hotelName} — ${s.city}`,
        })),
      }))}
    />
  );
}

export function BlocsAgence() {
  const { data: forfaits = [] } = useMyPackages();
  return (
    <RoomBlocksScreen
      forfaits={forfaits.map((f) => ({ id: f.id, title: f.title }))}
    />
  );
}
