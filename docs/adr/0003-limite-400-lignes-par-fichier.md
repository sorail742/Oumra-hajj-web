# ADR-0003 — Limite de 400 lignes par fichier de code

## Statut

Accepté — décision explicite de l'utilisateur (2026-09-16). Non
négociable : ne se discute pas au cas par cas, se corrige en découpant le
fichier.

## Contexte

`oumra-hadj-web` en est à son scaffold initial (voir ADR-0001, ADR-0002).
Aucun fichier de `src/` ne dépasse aujourd'hui 154 lignes hors code généré
— voir la mesure ci-dessous — mais rien n'empêchait jusqu'ici un fichier de
grossir sans limite au fil des écrans (Phase 2, `docs/socle-frontend.md`
§9) : un `route.ts`, un composant `features/*/components/`, un hook, qui
accumule plusieurs responsabilités au lieu d'être scindé.

Ce risque est plus concret que dans un projet développé main dans la main
par une équipe humaine : une bonne partie du code d'`oumra-hadj-web` est
écrite par un assistant IA (voir `CLAUDE.md`), qui a tendance, sans garde-
fou explicite, à faire grossir un seul fichier plutôt qu'à proposer un
découpage — la voie de moindre résistance immédiate, mais coûteuse à
relire, à revoir, et à confier à une future session qui doit recharger tout
le fichier pour comprendre une fonction.

Mesure au moment de la rédaction (`find src -name "*.ts" -o -name "*.tsx"`,
`src/lib/api/generated.ts` exclu) :

```
max observé : 154 lignes (src/app/api/[...chemin]/route.ts)
total       : 1261 lignes sur 23 fichiers
```

Aucun fichier n'approche la limite aujourd'hui — la règle est préventive,
pas corrective.

## Décision

**Aucun fichier de code source écrit à la main ne dépasse 400 lignes.**
Au-delà, le fichier est découpé — extraire une fonction dans un module
dédié, scinder un composant en sous-composants, déplacer un type dans
`types.ts` — jamais désactivé au cas par cas, jamais repoussé « pour plus
tard ».

### Portée

**S'applique** : tout fichier `.ts`/`.tsx` écrit à la main sous `src/`
(composants, hooks, `lib/`, `features/*`, Route Handlers, `config/`,
`stores/`), ainsi que les fichiers de configuration du projet
(`eslint.config.mjs`, `next.config.ts`, etc.).

**Ne s'applique pas** :

- `src/lib/api/generated.ts` — sorti d'`openapi-typescript`, jamais édité
  à la main (voir `CLAUDE.md`, `docs/socle-frontend.md` §3). Un fichier
  généré grossit avec le contrat API, pas avec une décision de conception
  qu'on pourrait mal prendre.
- Fichiers de verrouillage et artefacts (`pnpm-lock.yaml`, `.next/`,
  `storybook-static/`, rapports de couverture).
- Fichiers de données/traduction (`src/messages/fr.json`, `openapi.json`) —
  leur taille suit le contenu qu'ils portent (nombre de clés de traduction,
  taille du contrat API), pas une accumulation de logique.
- Documentation (`docs/*.md`) — un document de référence comme
  `docs/design-system.md` ou `docs/socle-frontend.md` organise
  délibérément plusieurs sections liées dans un seul fichier consultable ;
  le fragmenter au même seuil que du code nuirait à sa lisibilité au lieu
  de la servir. La discipline de fond (un sujet, un fichier) reste
  souhaitable en documentation, mais sans le couperet numérique fixé ici
  pour le code.

**Précision volontaire** : cette portée est un choix de bon sens fait au
moment de la rédaction, pas une clause négociée avec l'utilisateur — si
l'intention était plus large (y compris la documentation), le signaler
plutôt que de la découvrir au prochain gros fichier `docs/`.

### Application

Vérifiée par ESLint (`max-lines`, voir `eslint.config.mjs`), pas laissée à
la relecture — même principe que la règle `features/x` n'importe jamais
`features/y` (ADR implicite du socle, `docs/coding-rules-frontend.md`) :
une règle non négociable se fait respecter par l'outillage, pas par la
discipline individuelle.

## Justification

**Un fichier long mélange plusieurs responsabilités.** C'est la même
raison de fond qui justifie déjà `features/x` n'important jamais
`features/y`, un registre de statuts unique plutôt qu'un mapping par
écran, un client API unique plutôt que des `fetch` dispersés
(`docs/coding-rules-frontend.md`) : ce projet préfère systématiquement un
découpage explicite à une accumulation locale.

**Un fichier court se relit en un passage.** Que la revue soit humaine ou
par un futur agent IA repartant sans le contexte de cette conversation
(voir la note de gestion de contexte du système hôte), un fichier de moins
de 400 lignes tient dans une lecture unique, sans scroll ni relecture
partielle qui laisse échapper un détail.

**Le seuil est délibérément généreux.** 400 lignes n'est pas un seuil
serré au sens de la plupart des guides de style (souvent 200–300) : il
laisse de la marge à un composant avec plusieurs sous-fonctions ou un
Route Handler avec sa gestion d'erreurs complète (le proxy actuel,
`src/app/api/[...chemin]/route.ts`, fait 154 lignes avec son protocole de
renouvellement de jeton complet — voir ADR-0002) sans forcer un découpage
artificiel dès qu'un fichier devient un peu dense.

## Conséquences

### Ce que cela impose

- Tout nouveau fichier `.ts`/`.tsx` de `src/` est mesuré contre 400 lignes
  avant d'être considéré terminé — `pnpm lint` échoue sinon (règle
  `max-lines`).
- Un composant qui grossit se scinde par responsabilité (présentation vs
  logique, sous-composants, hook extrait) plutôt que de continuer à
  grossir jusqu'au refus du lint.
- Une extraction de dernière minute pour satisfaire la règle est un signe
  qu'il fallait découper plus tôt — la limite est un filet de sécurité,
  pas l'outil de conception.

### Ce que cela ne résout pas

- La limite ne garantit pas qu'un fichier de 390 lignes est bien conçu :
  elle attrape la dérive la plus visible (un fichier qui n'en finit plus
  de grossir), pas un mauvais découpage entre plusieurs fichiers courts.
- Un contournement mécanique (scinder un fichier en deux moitiés
  arbitraires pour repasser sous 400 lignes) viole l'esprit de la règle
  tout en respectant sa lettre — à signaler en revue comme un vrai
  problème, pas une solution.

## Alternatives écartées

**Un seuil plus bas (200–300 lignes).** Plus proche des guides de style
courants, mais risquait de forcer un découpage artificiel sur des fichiers
déjà bien conçus dès qu'ils gagnent une gestion d'erreurs complète ou
plusieurs variantes d'un même composant — voir la mesure du proxy actuel
(154 lignes) comme référence de ce qu'un fichier dense et cohérent occupe
déjà.

**Règle laissée à la discipline de revue, sans outillage.** Écartée pour
la même raison que `features/x` n'important jamais `features/y` est
vérifiée par ESLint plutôt que rappelée en revue : une règle non négociable
qui dépend de la vigilance humaine à chaque revue finit par être oubliée
une fois — l'outillage ne l'oublie jamais.

## Addendum — 2026-09-17

Recoupé contre `smartsms-frontend` (projet frère, sur demande explicite de
l'utilisateur de vérifier ce qu'il avait de nouveau à adapter ici) : leur
commit `efcdf68` a introduit la même règle le 2026-09-16, avec deux
différences qui méritent d'être tranchées, pas copiées telles quelles.

**Adopté** — `skipBlankLines: true, skipComments: true`. Leur mesure sur
leur propre dépôt : un compte incluant les commentaires pénalise
exactement la documentation abondante qu'ils encouragent (« ce projet
documente abondamment le pourquoi en commentaire »). Ce projet-ci a le
même style de commentaires denses (voir n'importe quel fichier de
`src/lib/` ou `src/features/`) — le même raisonnement s'applique mot pour
mot. `eslint.config.mjs` mis à jour en conséquence.

**Non adopté** — leur sévérité `warn`. Chez eux, un choix de migration
assumé : la règle a été posée alors que six fichiers dépassaient déjà 400
lignes (`DataTable.tsx` à 588, entre autres), avec `warn` comme mesure de
transition explicitement temporaire (« `max-lines` passera en `error` une
fois cette liste vidée »). `oumra-hadj-web` n'a pas cette dette : aucun
fichier n'a jamais dépassé le seuil depuis le scaffold initial (voir
mesure ci-dessus, 154 lignes maximum). Rien ne justifie d'affaiblir la
règle à `warn` ici — `error` reste la sévérité qui correspond à la
décision d'origine (« incontournable et intolérable »).

**Ajouté** — `max-depth: ['warn', 4]` et deux exemptions à `max-lines`
(`**/*.test.{ts,tsx}`, `src/components/ui/**`), avec le même raisonnement
qu'eux : un composant React est une fonction dont le JSX fait mentir
`complexity`/`max-lines-per-function` (ni l'un ni l'autre n'est adopté ici
non plus), un fichier de test long est souvent un fichier de test complet,
et des primitives shadcn générées ne se découpent pas sans compliquer
chaque mise à jour du générateur pour un bénéfice nul.

**Repéré à cette occasion, sans lien direct avec cette ADR** : leur
historique a aussi révélé un bug réel sur leurs modales (contenu sans
padding cohérent, #66 de leur dépôt) qui a motivé une vérification de nos
propres `Dialog` — `src/components/ui/dialog.tsx` ne contraignait pas la
hauteur d'un contenu long, corrigé séparément (voir le commit qui
accompagne cet addendum).
