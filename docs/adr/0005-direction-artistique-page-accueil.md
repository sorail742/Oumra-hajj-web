# ADR-0005 — Direction artistique propre à la page d'accueil publique

## Statut

Accepté le 2026-10-02, sur demande explicite de l'utilisateur (« landing
page vraiment impressionnante, élégante, beaucoup d'images et
d'animations »).

## Contexte

`docs/design-system.md` § 1 « Ce qu'on ne fait pas » exclut les dégradés,
les icônes décoratives et toute « illustration générique de voyage en fond
d'écran » : le produit doit ressembler à un dossier administratif fiable,
pas à une brochure touristique. Cette règle a été écrite pour l'**espace
authentifié** (tableaux, dossiers, paiements), où chaque pixel sert une
tâche.

La page d'accueil publique (`/`) a un autre rôle : convaincre un pèlerin
ou une agence, en quelques secondes, de faire confiance à la plateforme.
Sobre au point d'être vide (titre + deux boutons), elle ne remplissait pas
ce rôle.

Contraintes du dépôt qui restent entières :

- aucune valeur de style en dur hors de `src/app/globals.css` ;
- aucune chaîne en dur hors de `messages/fr.json` ;
- composants serveur par défaut, fichiers < 400 lignes (ADR-0003) ;
- contenu religieux signalé « à valider » (CLAUDE.md règle 13) ;
- pas de logo provisoire (`docs/socle-frontend.md` §0) ;
- l'environnement ne permet pas de télécharger de photographies, et une
  photo de banque d'images serait justement l'« illustration générique »
  que le design system refuse.

## Décision

1. **Exception limitée à la page d'accueil publique** (`src/features/landing`).
   L'espace authentifié et les écrans de travail gardent intégralement les
   règles de `docs/design-system.md`.
2. **Illustrations dessinées en SVG, pas de photographies** : ciel étoilé,
   silhouette de la Mecque (tour de l'horloge, minarets, arcades, Kaaba),
   croissant, rosace et pavage géométriques islamiques. Formes géométriques
   simples, aucune figure humaine. L'aperçu du produit est une maquette de
   l'interface réelle (téléphone, reçu, documents, messagerie), légendée
   « données fictives ».
3. **Tokens dédiés `landing-*`** dans `globals.css` (nuit, horizon, or,
   verre, ombre flottante, rayon d'appareil), et tailles d'affichage
   `text-4xl` à `text-6xl` réservées aux titres de cette page.
4. **Animations 100 % CSS** (§ 6 de `globals.css`) : entrée échelonnée,
   flottement, scintillement, bandeau défilant, apparition au défilement
   via `animation-timeline: view()` (sans JavaScript, ignorée par les
   navigateurs qui ne la gèrent pas). Aucune bibliothèque d'animation
   ajoutée. `prefers-reduced-motion` coupe tout : durée nulle, une seule
   itération, délai nul, apparitions au défilement désactivées.
5. **Aucun appel API** sur la page : elle s'affiche même backend
   indisponible, et reste servie sans JavaScript client propre.

## Conséquences

- Le principe « pas d'illustration de voyage » de `docs/design-system.md`
  reste vrai partout sauf sur `/` ; une note datée y renvoie vers cet ADR.
- Les tokens `landing-*` ne doivent pas être utilisés dans l'espace
  authentifié — une revue qui en trouve hors de `features/landing` (et des
  écrans d'authentification publics s'ils adoptent la même ambiance) les
  refuse.
- Quand l'identité visuelle définitive sera validée (logo, palette), les
  tokens `landing-*` sont l'unique endroit à ajuster.
