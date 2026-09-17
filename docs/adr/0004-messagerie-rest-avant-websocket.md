# ADR-0004 — Messagerie en REST + rafraîchissement périodique, pas de WebSocket pour l'instant

## Statut

Accepté pour la partie REST (implémentée le 2026-09-17). Le passage à un
canal temps réel reste **proposé**, bloqué sur une décision d'infrastructure
non tranchée — voir « Ce qui reste à trancher ».

## Contexte

Le backend expose deux surfaces pour la messagerie pèlerin ↔ agence/guide :

- REST : `GET /messaging/bookings/:bookingId/conversations/:channel`,
  `GET`/`POST /messaging/conversations/:id/messages`.
- Un gateway Socket.IO (`MessagingGateway`, namespace `messaging`, voir ADR
  0014 backend) pour le temps réel — évènements `conversation:join` et
  `message:send`/`message:new`.

**Le gateway authentifie le handshake avec le jeton d'accès brut, lisible
par le client** (`WsJwtAuthGuard.extractToken` : `handshake.auth.token`,
convention `socket.io-client`, ou en-tête `Authorization` à défaut).
`socket.io-client` ne peut fournir ce jeton que si du JavaScript côté
navigateur y a accès — **directement contraire à ADR-0002** de ce dépôt,
dont toute la raison d'être est qu'un XSS ne puisse jamais exfiltrer le
jeton parce qu'il ne quitte jamais un cookie `httpOnly`. Contourner ce
point pour la messagerie recréerait exactement le risque qu'ADR-0002
élimine partout ailleurs, pour une seule fonctionnalité.

## Décision

**Messagerie construite en REST à travers le proxy authentifié**
(`lib/api/client`, cookie `httpOnly`, comme tout le reste du produit) :
liste des conversations à la demande, liste des messages rafraîchie
périodiquement (`refetchInterval` TanStack Query), envoi par `POST`. Pas de
connexion Socket.IO ouverte depuis le navigateur.

## Justification

**Le compromis de sécurité n'est pas anodin.** Exposer le jeton d'accès à
`window` pour un seul canal (la messagerie) affaiblit la garantie qu'ADR-
0002 établit pour l'ensemble du produit — un XSS dans n'importe quel écran
pourrait alors exfiltrer un jeton valide, y compris pour appeler des routes
sans rapport avec la messagerie. Un affaiblissement ponctuel de ce type ne
se décide pas silencieusement dans le code d'un écran.

**REST + rafraîchissement périodique livre une fonctionnalité complète
aujourd'hui.** Un pèlerin ou une agence qui échange quelques messages par
jour sur l'avancement d'un dossier n'a pas le même besoin de latence qu'un
chat grand public — un délai de quelques secondes est un compromis
raisonnable, pas un défaut produit.

## Conséquences

### Ce que cela impose

- Aucun message n'apparaît instantanément chez le correspondant — visible
  au prochain intervalle de rafraîchissement.
- `readAt` (accusé de lecture) existe côté backend (`MessageShape.readAt`)
  mais n'a pas d'action dédiée dans le contrat REST actuel (aucune route
  `PATCH .../read` recensée) — jamais marqué côté client tant que cette
  route n'existe pas, plutôt que de deviner un comportement.

### Ce que cela ne résout pas

Le gateway Socket.IO existe côté backend et reste inutilisé côté web tant
que cette ADR n'est pas révisée.

## Ce qui reste à trancher

Faire du temps réel sans réexposer le jeton demande que le **navigateur ne
parle jamais directement au gateway** — le même principe que le proxy REST,
appliqué à un WebSocket :

- **Proxy WebSocket par Next.js** : le navigateur ouvre une connexion vers
  le domaine Next (cookie `httpOnly` envoyé nativement par le navigateur
  sur un WebSocket same-origin, contrairement à `socket.io-client`), Next
  relaie vers le gateway backend en y attachant le jeton lu côté serveur.
  Demande un serveur Node custom (`server.js` avec gestion manuelle de
  l'évènement `upgrade`) — les Route Handlers de l'App Router ne portent
  pas nativement l'upgrade WebSocket. `next.config.ts` a déjà
  `output: "standalone"` (pensé pour Docker), compatible avec cette
  approche, mais rien n'est câblé aujourd'hui.
- **Jeton dédié WS, à portée réduite** : si le backend introduit un jour un
  jeton distinct de l'access token (durée de vie courte, scope limité à la
  connexion socket), l'exposer côté client redeviendrait acceptable — ADR
  à réviser à ce moment, pas avant qu'un tel jeton existe.

Ne pas construire l'un ou l'autre par anticipation : un serveur custom
engage l'infrastructure de déploiement (ADR-0001 la laisse justement
ouverte), un jeton à portée réduite n'existe pas côté backend aujourd'hui.

## Alternatives écartées

**Exposer l'access token existant au client pour le seul besoin du
handshake WebSocket.** Techniquement le plus simple, mais annule
directement la garantie d'ADR-0002 — écarté sans ambiguïté.

**Ne pas construire la messagerie tant que le temps réel n'est pas
possible.** Prive l'utilisateur d'une fonctionnalité complète et
fonctionnelle (REST) en attendant une décision d'infrastructure qui n'a pas
de date — le rafraîchissement périodique n'est pas une solution de repli
honteuse, c'est un choix de latence assumé.
