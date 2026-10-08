import { z } from "zod";

/**
 * `RoomBlockShape` / `MyRoomShape` (`oumra-hajj-backend/src/types/room.types.ts`,
 * idée #40, lu le 2026-10-08) — allotement : blocs de chambres réservés
 * auprès d'un hôtel pour un forfait, attribués au fil des ventes.
 */
export const ROOM_TYPES = [
  "double",
  "triple",
  "quadruple",
  "quintuple",
] as const;
export type RoomType = (typeof ROOM_TYPES)[number];

export const roomOccupantSchema = z.object({
  bookingId: z.string(),
  pilgrimName: z.string(),
});

export const roomBlockSchema = z.object({
  id: z.string(),
  packageId: z.string(),
  packageTitle: z.string(),
  stageId: z.string().optional(),
  hotelName: z.string(),
  city: z.string(),
  roomType: z.enum(ROOM_TYPES),
  roomCount: z.number(),
  bedsPerRoom: z.number(),
  totalBeds: z.number(),
  assignedBeds: z.number(),
  releaseDate: z.string().optional(),
  notes: z.string().optional(),
  rooms: z.array(
    z.object({ number: z.number(), occupants: z.array(roomOccupantSchema) }),
  ),
  unassigned: z.array(roomOccupantSchema),
});

export const myRoomSchema = z.object({
  hotelName: z.string(),
  city: z.string(),
  roomType: z.enum(ROOM_TYPES),
  roomNumber: z.number(),
  packageTitle: z.string(),
  startDate: z.string().optional(),
  endDate: z.string().optional(),
});

export type RoomBlock = z.infer<typeof roomBlockSchema>;
export type RoomOccupant = z.infer<typeof roomOccupantSchema>;
export type MyRoom = z.infer<typeof myRoomSchema>;

export interface NouveauBloc {
  packageId: string;
  stageId?: string;
  hotelName?: string;
  city?: string;
  roomType: RoomType;
  roomCount: number;
  releaseDate?: string;
  notes?: string;
}
