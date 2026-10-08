"use client";

import "maplibre-gl/dist/maplibre-gl.css";
import { useEffect, useRef } from "react";
import { useTheme } from "next-themes";
import {
  LngLatBounds,
  Map as CarteMapLibre,
  Marker,
  NavigationControl,
  getVersion,
  setWorkerUrl,
  type GeoJSONSource,
} from "maplibre-gl";
import type { Fraicheur, RolePosition } from "../../lib/suivi";
import { classesRepere, couleurDuToken, STYLES_CARTE } from "./carte-style";

/**
 * Carte des positions du groupe (ADR-0007) — MapLibre GL, chargée par
 * import dynamique depuis `EcranSuivi` seulement. Un repère cliquable par
 * position ; trait pointillé du guide vers la personne sélectionnée. Le
 * style suit le thème clair/sombre. Les coordonnées ne partent que vers
 * l'API du projet : le fournisseur de tuiles ne voit que la zone affichée.
 */
export interface Repere {
  id: string;
  libelle: string;
  lat: number;
  lng: number;
  role: RolePosition;
  fraicheur: Fraicheur;
}

// Copie servie depuis `public/` (scripts/copier-worker-maplibre.mjs) :
// l'adresse par défaut du worker ne survit pas à l'empaquetage.
setWorkerUrl(`/vendor/maplibre-gl/${getVersion()}/maplibre-gl-worker.mjs`);

const CENTRE_PAR_DEFAUT: [number, number] = [39.8262, 21.4225]; // La Mecque
const SOURCE_LIAISON = "liaison-guide";

/** Type GeoJSON tel que MapLibre l'attend (le namespace n'est pas global). */
type DonneesGeo = Exclude<Parameters<GeoJSONSource["setData"]>[0], string>;

export function CarteSuivi({
  reperes,
  selection,
  onSelect,
  libelle,
  recentrage,
  onErreur,
}: Readonly<{
  reperes: readonly Repere[];
  selection: string | undefined;
  onSelect: (id: string) => void;
  libelle: string;
  /** Change de valeur pour demander un recadrage sur tout le groupe. */
  recentrage: number;
  onErreur: () => void;
}>) {
  const { resolvedTheme } = useTheme();
  const theme = resolvedTheme === "dark" ? "dark" : "light";
  const conteneur = useRef<HTMLDivElement>(null);
  const carte = useRef<CarteMapLibre | null>(null);
  const marqueurs = useRef(new Map<string, Marker>());
  const cadre = useRef(false);
  // Dernières props lues par les écouteurs de la carte, sans les recréer.
  // Déclaré en premier : les effets suivants lisent des valeurs à jour.
  const courant = useRef({ reperes, selection, onSelect, onErreur });
  useEffect(() => {
    courant.current = { reperes, selection, onSelect, onErreur };
  });

  // Création, une fois. La carte vit hors de React : on la pilote.
  useEffect(() => {
    if (!conteneur.current) return undefined;
    let chargee = false;
    const instance = new CarteMapLibre({
      container: conteneur.current,
      style: STYLES_CARTE[theme],
      center: CENTRE_PAR_DEFAUT,
      zoom: 13,
      attributionControl: { compact: true },
    });
    instance.addControl(
      new NavigationControl({ showCompass: false }),
      "top-right",
    );
    instance.on("load", () => {
      chargee = true;
    });
    // Seul un échec avant le premier chargement (style, réseau) est
    // bloquant ; une tuile manquante ensuite ne l'est pas.
    instance.on("error", () => {
      if (!chargee) courant.current.onErreur();
    });
    instance.on("style.load", () =>
      tracerLiaison(
        instance,
        courant.current.reperes,
        courant.current.selection,
      ),
    );
    carte.current = instance;
    const reperesAffiches = marqueurs.current;
    return () => {
      reperesAffiches.clear();
      instance.remove();
      carte.current = null;
    };
    // Le thème initial seul : ses changements passent par `setStyle`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    carte.current?.setStyle(STYLES_CARTE[theme]);
  }, [theme]);

  // Repères : ajout, mise à jour, retrait — puis liaison guide → sélection.
  useEffect(() => {
    const instance = carte.current;
    if (!instance) return;
    const presents = new Set(reperes.map((r) => r.id));
    for (const [id, marqueur] of marqueurs.current) {
      if (!presents.has(id)) {
        marqueur.remove();
        marqueurs.current.delete(id);
      }
    }
    for (const repere of reperes) {
      const element =
        marqueurs.current.get(repere.id)?.getElement() ??
        creerElement(repere.id, (id) => courant.current.onSelect(id));
      remplirElement(element, repere, repere.id === selection);
      const existant = marqueurs.current.get(repere.id);
      if (existant) {
        existant.setLngLat([repere.lng, repere.lat]);
      } else {
        marqueurs.current.set(
          repere.id,
          new Marker({ element, anchor: "bottom" })
            .setLngLat([repere.lng, repere.lat])
            .addTo(instance),
        );
      }
    }
    if (instance.isStyleLoaded()) tracerLiaison(instance, reperes, selection);
  }, [reperes, selection]);

  // Cadrage : sur tout le groupe à la première donnée et sur demande.
  useEffect(() => {
    const instance = carte.current;
    if (!instance || reperes.length === 0) return;
    if (cadre.current && recentrage === 0) return;
    cadre.current = true;
    const limites = new LngLatBounds();
    for (const r of reperes) limites.extend([r.lng, r.lat]);
    instance.fitBounds(limites, { padding: 72, maxZoom: 16, duration: 600 });
    // Les repères qui bougent ne recadrent pas : l'utilisateur garde la main.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reperes.length > 0, recentrage]);

  // Sélection : la carte va vers la personne choisie.
  useEffect(() => {
    const instance = carte.current;
    const cible = courant.current.reperes.find((r) => r.id === selection);
    if (!instance || !cible) return;
    instance.flyTo({
      center: [cible.lng, cible.lat],
      zoom: Math.max(instance.getZoom(), 15),
      duration: 700,
    });
  }, [selection]);

  // MapLibre pose `position: relative` sur son conteneur : il remplit donc
  // un parent positionné plutôt que de l'être lui-même.
  return (
    <div className="absolute inset-0">
      <div
        ref={conteneur}
        role="region"
        aria-label={libelle}
        className="h-full w-full"
      />
    </div>
  );
}

/** Trait pointillé du guide vers la personne sélectionnée (si les deux sont connus). */
function tracerLiaison(
  instance: CarteMapLibre,
  liste: readonly Repere[],
  choisi: string | undefined,
) {
  const guide = liste.find((r) => r.role === "guide");
  const cible = liste.find((r) => r.id === choisi);
  const donnees: DonneesGeo = {
    type: "FeatureCollection",
    features:
      guide && cible && guide.id !== cible.id
        ? [
            {
              type: "Feature",
              properties: {},
              geometry: {
                type: "LineString",
                coordinates: [
                  [guide.lng, guide.lat],
                  [cible.lng, cible.lat],
                ],
              },
            },
          ]
        : [],
  };
  const source = instance.getSource<GeoJSONSource>(SOURCE_LIAISON);
  if (source) {
    source.setData(donnees).catch(() => undefined);
    return;
  }
  instance.addSource(SOURCE_LIAISON, { type: "geojson", data: donnees });
  const couleur = couleurDuToken("--primary");
  instance.addLayer({
    id: SOURCE_LIAISON,
    type: "line",
    source: SOURCE_LIAISON,
    layout: { "line-cap": "round" },
    paint: {
      ...(couleur ? { "line-color": couleur } : {}),
      "line-width": 2.5,
      "line-dasharray": [1.5, 1.5],
    },
  });
}

/** Élément DOM d'un repère : un bouton, donc atteignable au clavier. */
function creerElement(id: string, onSelect: (id: string) => void) {
  const bouton = document.createElement("button");
  bouton.type = "button";
  bouton.addEventListener("click", (evenement) => {
    evenement.stopPropagation();
    onSelect(id);
  });
  bouton.append(document.createElement("span"), document.createElement("span"));
  return bouton;
}

function remplirElement(element: HTMLElement, repere: Repere, choisi: boolean) {
  const classes = classesRepere(repere.role, repere.fraicheur, choisi);
  const [etiquette, point] = element.children;
  element.className = classes.bouton;
  element.setAttribute("aria-label", repere.libelle);
  element.setAttribute("aria-pressed", String(choisi));
  if (etiquette instanceof HTMLElement) {
    etiquette.className = classes.etiquette;
    etiquette.textContent = repere.libelle;
  }
  if (point instanceof HTMLElement) point.className = classes.point;
}
