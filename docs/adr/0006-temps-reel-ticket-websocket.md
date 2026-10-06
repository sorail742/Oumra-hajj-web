# ADR-0006 — Temps réel : ticket WebSocket éphémère émis par le backend

## Statut

**Proposé** (2026-10-06) — à confirmer par le porteur de projet. Remplacera,
une fois accepté, la partie « temps réel » d'ADR-0004 (la partie REST reste
en vigueur, comme solution de repli). Demande un ADR jumeau côté backend
(nouvelle route et changement d'authentification du gateway).

## Contexte

- La messagerie (#66, #67) et la discussion de groupe (#84) fonctionnent en
  REST avec rafraîchissement périodique (5 à 30 s, ADR-0004).
- Le backend expose deux gateways Socket.IO (`messaging`, `community`) dont
  le handshake exige **le jeton d'accès brut** (`WsJwtAuthGuard`). Le web
  ne peut pas le fournir sans le sortir du cookie `httpOnly` : interdit par
  ADR-0002.
- **Hébergement** (ADR 0024 backend) : le web est sur **Vercel**, dont les
  fonctions ne maintiennent pas de connexion WebSocket. Le backend est sur
  Render, qui les accepte.

## Options

| Option                                             | Principe                                                                                                                                          | Verdict                                                                                     |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------- |
| A. Proxy WebSocket par un serveur Node Next custom | Le navigateur se connecte au domaine Next avec son cookie ; Next relaie au gateway avec le jeton                                                  | **Impossible sur Vercel** : il faudrait déplacer l'hébergement du web (révision d'ADR 0024) |
| B. **Ticket éphémère émis par le backend**         | Le navigateur demande, via le proxy authentifié, un ticket à usage unique de 30 s ; il le présente au handshake Socket.IO, directement au backend | **Recommandée**                                                                             |
| C. Service temps réel tiers (Pusher, Ably…)        | Le backend publie, un service externe diffuse                                                                                                     | Nouveau fournisseur, coût, données personnelles chez un tiers : disproportionné             |
| D. Statu quo (REST + sondage)                      | Rien ne change                                                                                                                                    | Reste la solution de repli dans tous les cas                                                |

## Décision proposée (option B)

1. **Backend** — `POST /realtime/ticket` (authentifié, donc appelé à travers
   le proxy Next et son cookie) renvoie `{ ticket, expiresAt }` :
   - JWT signé avec un secret **distinct** de l'access token, audience
     `ws`, durée de vie **30 s**, identifiant unique (`jti`) **à usage
     unique** (refusé s'il a déjà servi) ;
   - porte seulement `sub` et `role` — rien d'autre.
2. **Gateways** `messaging` et `community` : acceptent ce ticket
   (`handshake.auth.ticket`) et **plus jamais l'access token venant d'un
   navigateur** ; les contrôles d'accès existants (participant du fil,
   membre du groupe) restent inchangés.
3. **Web** — `socket.io-client` (dépendance ajoutée, version épinglée) se
   connecte directement au backend (`NEXT_PUBLIC_API_URL`), avec un ticket
   neuf à chaque (re)connexion. CORS du gateway limité à l'origine du web.
4. **Durée de session** : le backend ferme la connexion après 15 min (le
   client se reconnecte avec un nouveau ticket) et dès la déconnexion de
   l'utilisateur (`/auth/logout`), pour qu'un compte révoqué ne reste pas
   à l'écoute.
5. **Repli** : si la connexion échoue (réseau, offre gratuite de Render en
   veille), l'écran garde le rafraîchissement périodique d'ADR-0004. Le
   temps réel n'est qu'une accélération, jamais une dépendance.

## Pourquoi c'est compatible avec ADR-0002

ADR-0002 garantit qu'un XSS ne peut pas **exfiltrer** un jeton réutilisable
ailleurs. Un ticket de 30 s, à usage unique, limité au handshake : un XSS
qui le volerait n'obtiendrait pas plus que ce qu'il peut déjà faire en
appelant le proxy depuis la page compromise. L'access token, lui, ne quitte
toujours jamais le cookie `httpOnly`.

## Conséquences

- Messages et discussion de groupe instantanés ; indicateur « en ligne »
  ou « en train d'écrire » possible plus tard.
- Travail backend : route de ticket, garde du gateway, fermeture à la
  déconnexion, tests e2e Socket.IO. Travail web : un client par
  namespace, invalidation du cache TanStack Query à la réception d'un
  évènement (la liste reste lue en REST, source unique).
- Une connexion persistante par utilisateur actif sur Render : à surveiller
  sur l'offre gratuite.

## Ce qu'il faut décider

Accepter l'option B (et lancer l'ADR jumeau côté backend), ou garder le
statu quo (D) tant que la latence de quelques secondes suffit.
