"use client";

import { useEffect, useRef, useState } from "react";
import { io, type Socket } from "socket.io-client";
import { z } from "zod";
import { api } from "@/lib/api/client";

/**
 * Connexion temps réel (ADR-0006 web, ADR 0027 backend). Le navigateur ne
 * détient jamais l'access token : avant chaque (re)connexion, il demande au
 * backend, via le proxy authentifié, un ticket de 30 s à usage unique, et
 * le présente au handshake Socket.IO.
 *
 * Accélération seulement : sans `NEXT_PUBLIC_REALTIME_URL`, ou si la
 * connexion échoue, les écrans gardent leur rafraîchissement périodique
 * (ADR-0004). Le hook renvoie `connecte` pour espacer ce sondage.
 */
const URL_TEMPS_REEL = process.env["NEXT_PUBLIC_REALTIME_URL"];
const ticketSchema = z.object({ ticket: z.string() });
const DELAI_RECONNEXION_MS = 2_000;
/** Au-delà, on reste sur le sondage (temps réel non configuré, session finie). */
const ECHECS_MAX = 3;
const DUREE_SESSION_VALIDE_MS = 10_000;

async function obtenirTicket(): Promise<string> {
  const { ticket } = ticketSchema.parse(
    await api.post<unknown>("/api/auth/realtime-ticket"),
  );
  return ticket;
}

export function useTempsReel({
  namespace,
  rejoindre,
  evenement,
  onEvenement,
  actif = true,
}: Readonly<{
  namespace: "messaging" | "community";
  /** Évènement et identifiant de room à rejoindre après chaque connexion. */
  rejoindre: { evenement: string; id: string } | undefined;
  evenement: string;
  onEvenement: () => void;
  actif?: boolean;
}>): { connecte: boolean } {
  const [connecte, setConnecte] = useState(false);
  const rappel = useRef(onEvenement);
  useEffect(() => {
    rappel.current = onEvenement;
  }, [onEvenement]);
  const roomEvenement = rejoindre?.evenement;
  const roomId = rejoindre?.id;

  useEffect(() => {
    if (!URL_TEMPS_REEL || !actif || !roomEvenement || !roomId) return;
    let ferme = false;
    let echecs = 0;
    let connecteDepuis = 0;
    let minuterie: ReturnType<typeof setTimeout> | undefined;

    const socket: Socket = io(
      new URL(`/${namespace}`, URL_TEMPS_REEL).toString(),
      {
        transports: ["websocket"],
        // Un ticket neuf à chaque tentative, y compris les reconnexions.
        auth: (cb) => {
          obtenirTicket().then(
            (ticket) => cb({ ticket }),
            () => cb({}),
          );
        },
      },
    );

    socket.on("connect", () => {
      connecteDepuis = Date.now();
      setConnecte(true);
      socket.emit(roomEvenement, roomId);
    });
    socket.on(evenement, () => rappel.current());
    socket.on("connect_error", () => {
      echecs += 1;
      if (echecs >= ECHECS_MAX) socket.close();
    });
    socket.on("disconnect", (raison) => {
      setConnecte(false);
      // Fermeture par le serveur (session de 15 min, ticket refusé) :
      // Socket.IO ne se reconnecte pas seul dans ce cas.
      if (raison === "io server disconnect" && !ferme) {
        // Une connexion refusée par le serveur (ticket invalide, temps réel
        // non configuré) se ferme aussitôt : seule une session qui a duré
        // remet le compteur d'échecs à zéro.
        echecs =
          Date.now() - connecteDepuis < DUREE_SESSION_VALIDE_MS
            ? echecs + 1
            : 0;
        if (echecs < ECHECS_MAX) {
          minuterie = setTimeout(() => socket.connect(), DELAI_RECONNEXION_MS);
        }
      }
    });

    return () => {
      ferme = true;
      clearTimeout(minuterie);
      socket.close();
      setConnecte(false);
    };
  }, [namespace, roomEvenement, roomId, evenement, actif]);

  return { connecte };
}
