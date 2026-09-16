# Architecture Decision Records — oumra-hadj-web

Registre des décisions d'architecture significatives et de leur contexte.

## Format

Un fichier par décision, `NNNN-titre-court.md`, numérotation séquentielle.
Statuts : `proposé`, `accepté`, `déprécié`, `remplacé par ADR-xxxx` — jamais
réécrit une fois accepté (ajouter une section datée plutôt que modifier le
texte existant), même convention que le backend
(`Oumra-hadj-project/docs/adr/0011-conventions-git-branches.md`).

## Index

| ADR                                                 | Titre                                                           | Statut  |
| --------------------------------------------------- | --------------------------------------------------------------- | ------- |
| [0001](0001-stack-nextjs-app-router.md)             | Next.js App Router comme stack frontend                         | Accepté |
| [0002](0002-jeton-cookie-httponly-proxy-refresh.md) | Jeton en cookie httpOnly, proxy avec renouvellement automatique | Accepté |

Les deux sont passées à `accepté` le 2026-09-16 : le scaffold réel a été
créé sur cette base (Next.js App Router, proxy `src/app/api/[...chemin]`,
cookies `oumra_access`/`oumra_refresh`). Toute évolution ultérieure du choix
se fait par un nouvel ADR qui remplace celui-ci, pas par une réécriture du
texte existant.

## Quand créer un nouvel ADR

Pour toute décision qui engage l'architecture au-delà d'un composant isolé :
choix de librairie structurante, pattern de state management, stratégie de
routing, changement de stack, nouveau service externe (paiement, SMS,
stockage). Pas nécessaire pour une décision locale à un seul composant.

Même règle que côté backend (`CLAUDE.md`) : proposer l'ADR en statut
`proposé` **avant** d'implémenter un choix structurant, plutôt que de
décider silencieusement dans le code.
