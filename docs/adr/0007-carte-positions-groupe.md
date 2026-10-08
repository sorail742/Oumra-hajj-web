# ADR-0007 — Carte intégrée des positions du groupe

## Statut

**Accepté** (2026-10-08) — option A retenue par le porteur de projet
(« il doit avoir tout » : carte, liste et détail).

Mise en œuvre : `src/features/groups/components/suivi/` (écran
`/groups/:id/tracking`), `src/features/groups/lib/suivi.ts` (logique pure,
testée). Variables publiques facultatives : `NEXT_PUBLIC_MAP_STYLE_LIGHT`,
`NEXT_PUBLIC_MAP_STYLE_DARK` (par défaut, styles OpenFreeMap `positron` et
`dark`).

**Point technique découvert à la mise en œuvre** : MapLibre v6 calcule
l'adresse de son Web Worker à l'exécution, à côté de son propre fichier —
adresse perdue une fois le code empaqueté par Next (« Worker failed to
load »). `scripts/copier-worker-maplibre.mjs` copie le worker et le module
partagé qu'il importe dans `public/vendor/maplibre-gl/<version>/` avant
`next dev` et `next build` (dossier ignoré par git), et la carte s'y
réfère par `setWorkerUrl`. Le proxy d'authentification exclut `/vendor/`.

## Contexte

- Le partage de position (ticket #85) fonctionne : chaque membre peut
  envoyer volontairement sa position au groupe, et `MemberLocations` liste
  les positions avec un lien « ouvrir sur OpenStreetMap » dans un nouvel
  onglet. Le composant l'écrit lui-même : « une bibliothèque cartographique
  demande un ADR ».
- Le porteur de projet demande (2026-10-08) un écran de suivi façon
  « tracking » : liste des membres à gauche, carte sombre à droite avec les
  positions, détail du membre sélectionné en dessous.
- Contraintes déjà actées :
  - les positions sont des **données sensibles et opt-in** (ADR 0008
    backend) — jamais journalisées, jamais mises en cache au-delà de
    l'écran ;
  - le web tourne sur **Vercel** (ADR 0024 backend) ; aucune clé d'API ne
    doit partir dans le bundle sans y être destinée ;
  - usage réel : un guide qui cherche un pèlerin égaré à La Mecque ou à
    Médine — il faut **les rues**, pas un planisphère décoratif.

## Options

| Option                                                    | Principe                                                                                                                            | Coût / risque                                                                                                                                                                              |
| --------------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| **A. MapLibre GL JS + tuiles vectorielles OpenFreeMap**   | Carte vectorielle (WebGL), style clair et style sombre fournis, données OpenStreetMap ; OpenFreeMap est gratuit, sans clé ni compte | Dépendance `maplibre-gl` (~800 Ko, chargée **uniquement** sur l'écran de suivi, import dynamique) ; service tiers sans contrat de disponibilité (repli : le lien OSM actuel reste affiché) |
| B. Leaflet + tuiles raster (OSM ou CARTO « dark matter ») | Bibliothèque légère (~150 Ko), images de tuiles                                                                                     | Les tuiles OSM interdisent l'usage intensif par une application ; CARTO limite l'usage gratuit et impose une clé au-delà ; rendu moins net, mode sombre par filtre CSS                     |
| C. Fournisseur commercial (Mapbox, Google Maps)           | SDK du fournisseur                                                                                                                  | Clé d'API, facturation à l'usage, données de navigation transmises à un tiers commercial — à écarter pour une démo                                                                         |
| D. Sans carte : schéma SVG des positions relatives        | Points placés autour du centre du groupe, sans fond de rues                                                                         | Aucune dépendance, mais **inutilisable pour retrouver quelqu'un** : pas de rues ni de repères                                                                                              |

## Proposition

**Option A.** Seule option qui donne une vraie carte (rues, repères,
style sombre cohérent avec le thème) sans clé, sans compte et sans coût.

Garde-fous si elle est retenue :

- `maplibre-gl` épinglé sans `^`, importé dynamiquement par l'écran de
  suivi seulement (pas dans le bundle commun) ;
- l'adresse du style vient d'une variable `NEXT_PUBLIC_MAP_STYLE_URL`
  (changer de fournisseur = changer une variable, pas le code) ;
- les coordonnées ne quittent le navigateur que vers l'API du projet ; le
  fournisseur de tuiles ne voit que la **zone affichée**, pas l'identité ni
  les positions des membres — à mentionner dans la politique de
  confidentialité ;
- rien n'est mis en cache côté navigateur au-delà de l'écran (règle 14
  étendue aux positions) ;
- si la carte ne charge pas (réseau, fournisseur indisponible), l'écran
  garde la liste et les liens « ouvrir sur OpenStreetMap » actuels.

## Conséquences

- Nouvel écran de suivi : liste des membres partageant leur position
  (dernière mise à jour, rôle), carte avec un repère par membre, panneau de
  détail du membre sélectionné ; même écran en clair et en sombre.
- Si l'option A est refusée, l'écran peut quand même adopter la mise en
  page « liste + détail », sans la carte (option D ou statu quo).
