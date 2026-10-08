"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { myRoomSchema, roomBlockSchema, type NouveauBloc } from "./schemas";

const blocs = z.array(roomBlockSchema);

export function useBlocsChambres(packageId: string | undefined) {
  return useQuery({
    queryKey: keys.rooms.blocks({ packageId }),
    queryFn: async () =>
      blocs.parse(
        await api.get<unknown>("/api/rooms/blocks", { params: { packageId } }),
      ),
  });
}

export function useMesChambres() {
  return useQuery({
    queryKey: keys.rooms.mine(),
    queryFn: async () =>
      z.array(myRoomSchema).parse(await api.get<unknown>("/api/rooms/mine")),
  });
}

/** Toute écriture rafraîchit la liste des blocs (occupation, à placer). */
function useEcritureBloc<V>(appel: (variables: V) => Promise<unknown>) {
  const client = useQueryClient();
  return useMutation({
    mutationFn: appel,
    onSuccess: () => client.invalidateQueries({ queryKey: keys.rooms.all }),
  });
}

export function useCreerBloc() {
  return useEcritureBloc((bloc: NouveauBloc) =>
    api.post<unknown>("/api/rooms/blocks", bloc),
  );
}

export function useSupprimerBloc() {
  return useEcritureBloc((id: string) =>
    api.delete<unknown>(`/api/rooms/blocks/${encodeURIComponent(id)}`),
  );
}

export function usePlacerReservation(blockId: string) {
  return useEcritureBloc((place: { bookingId: string; roomNumber?: number }) =>
    api.put<unknown>(
      `/api/rooms/blocks/${encodeURIComponent(blockId)}/assignments`,
      place,
    ),
  );
}

export function useLibererPlace(blockId: string) {
  return useEcritureBloc((bookingId: string) =>
    api.delete<unknown>(
      `/api/rooms/blocks/${encodeURIComponent(blockId)}/assignments/${encodeURIComponent(bookingId)}`,
    ),
  );
}

export function lienRoomingList(blockId: string): string {
  return `/api/rooms/blocks/${encodeURIComponent(blockId)}/rooming-list/csv`;
}
