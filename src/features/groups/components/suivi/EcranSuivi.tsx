"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { ArrowLeft, LocateFixed, MapPinOff } from "lucide-react";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Can } from "@/components/shared/Can";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { PageHeader } from "@/components/shared/PageHeader";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useUserId } from "@/lib/auth/role-context";
import { useGroup } from "../../api/use-groups";
import type { Group } from "../../api/schemas";
import {
  filtrer,
  fraicheur,
  libellePosition,
  lireFiltre,
  positionsSuivies,
  type FiltreSuivi,
  type PositionSuivie,
} from "../../lib/suivi";
import { LocationSharingCard } from "../LocationSharingCard";
import { DetailSuivi } from "./DetailSuivi";
import { ListeSuivi } from "./ListeSuivi";

// MapLibre (~800 Ko) n'est chargé que sur cet écran, jamais côté serveur.
const CarteSuivi = dynamic(
  () => import("./CarteSuivi").then((m) => m.CarteSuivi),
  { ssr: false, loading: () => <Skeleton className="absolute inset-0" /> },
);

const RAFRAICHISSEMENT_HORLOGE_MS = 30_000;

/**
 * Suivi des positions d'un groupe (ADR-0007) : liste à gauche, carte et
 * détail à droite ; sous `lg`, la carte passe en tête. Filtre et personne
 * sélectionnée vivent dans l'URL (règle 8). Positions rafraîchies toutes
 * les 30 s ; rien n'est conservé en quittant l'écran.
 */
export function EcranSuivi({ id }: Readonly<{ id: string }>) {
  const query = useGroup(id, { suivi: true });

  return (
    <AsyncBoundary
      query={query}
      skeleton={<DetailSkeleton />}
      isEmpty={() => false}
    >
      {(group) => <Suivi group={group} />}
    </AsyncBoundary>
  );
}

function Suivi({ group }: Readonly<{ group: Group }>) {
  const t = useTranslations("groups.tracking");
  const tPosition = useTranslations("groups.location");
  const userId = useUserId();
  const router = useRouter();
  const chemin = usePathname();
  const params = useSearchParams();
  const [maintenant, setMaintenant] = useState(() => Date.now());
  const [recentrage, setRecentrage] = useState(0);
  const [carteEnErreur, setCarteEnErreur] = useState(false);

  useEffect(() => {
    const minuterie = setInterval(
      () => setMaintenant(Date.now()),
      RAFRAICHISSEMENT_HORLOGE_MS,
    );
    return () => clearInterval(minuterie);
  }, []);

  const toutes = positionsSuivies(group, userId);
  const filtre = lireFiltre(params.get("filtre"));
  const visibles = filtrer(toutes, filtre, maintenant);
  const selection = toutes.find((p) => p.userId === params.get("membre"));
  const guide = toutes.find((p) => p.role === "guide");

  function majUrl(changements: Record<string, string | undefined>) {
    const suivants = new URLSearchParams(params.toString());
    for (const [cle, valeur] of Object.entries(changements)) {
      if (valeur) suivants.set(cle, valeur);
      else suivants.delete(cle);
    }
    const requete = suivants.toString();
    router.replace(requete ? `${chemin}?${requete}` : chemin, {
      scroll: false,
    });
  }

  const libelle = (p: PositionSuivie) => libellePosition(p, tPosition);

  const retour = (
    <Button variant="outline" asChild>
      <Link href={`/groups/${group.id}`}>
        <ArrowLeft aria-hidden />
        {t("back")}
      </Link>
    </Button>
  );

  return (
    <div>
      <PageHeader
        title={t("title")}
        description={t("description", { group: group.title })}
        action={retour}
      />
      {toutes.length === 0 ? (
        <div className="bg-card rounded-lg border">
          <EmptyState
            title={t("emptyTitle")}
            description={t("emptyDescription")}
          />
        </div>
      ) : (
        <div className="grid gap-4 lg:h-[calc(100svh-14rem)] lg:min-h-[36rem] lg:grid-cols-[22rem_minmax(0,1fr)]">
          <div className="order-2 flex min-h-0 flex-col lg:order-1">
            <ListeSuivi
              positions={visibles}
              total={toutes.length}
              filtre={filtre}
              onFiltre={(f: FiltreSuivi) =>
                majUrl({ filtre: f === "all" ? undefined : f })
              }
              selection={selection?.userId}
              onSelect={(membre) => majUrl({ membre })}
              libelle={libelle}
              maintenant={maintenant}
            />
          </div>
          <div className="order-1 flex min-h-0 flex-col gap-4 lg:order-2">
            <div className="bg-muted relative h-80 overflow-hidden rounded-lg border shadow-(--shadow-card) lg:h-auto lg:min-h-0 lg:flex-1">
              {carteEnErreur ? (
                <div className="text-muted-foreground absolute inset-0 flex flex-col items-center justify-center gap-2 p-6 text-center text-sm">
                  <MapPinOff aria-hidden className="size-6" />
                  {t("mapError")}
                </div>
              ) : (
                <>
                  <CarteSuivi
                    reperes={visibles.map((p) => ({
                      id: p.userId,
                      libelle: libelle(p),
                      lat: p.lat,
                      lng: p.lng,
                      role: p.role,
                      fraicheur: fraicheur(p.updatedAt, maintenant),
                    }))}
                    selection={selection?.userId}
                    onSelect={(membre) => majUrl({ membre })}
                    libelle={t("mapLabel")}
                    recentrage={recentrage}
                    onErreur={() => setCarteEnErreur(true)}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setRecentrage((n) => n + 1)}
                    className="absolute top-3 left-3 z-10"
                  >
                    <LocateFixed aria-hidden />
                    {t("recenter")}
                  </Button>
                </>
              )}
            </div>
            <DetailSuivi
              position={selection}
              libelle={selection ? libelle(selection) : ""}
              guide={guide}
              itineraire={group.itinerary}
              maintenant={maintenant}
            />
          </div>
        </div>
      )}
      {/* Sous la carte : sur mobile, elle reste visible dès l'ouverture. */}
      <Can role={["pilgrim", "guide"]}>
        <div className="mt-4">
          <LocationSharingCard groupId={group.id} />
        </div>
      </Can>
    </div>
  );
}
