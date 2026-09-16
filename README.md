# oumra-hadj-web

Frontend Next.js de la plateforme Oumra & Hadj (back-office agences/admin,
espace pèlerin). Consomme l'API REST de `Oumra-hadj-project` (NestJS), dont
le contrat vit dans `openapi.json`.

**Lire `CLAUDE.md` avant toute modification** — il renvoie vers `docs/` pour
le détail (socle, design system, contrat API, architecture, ADR).

## Démarrer

```bash
pnpm install
pnpm dev              # http://localhost:3010
```

Copier `.env.example` en `.env.local` et renseigner `BACKEND_URL` (le
backend `Oumra-hadj-project`, non préfixé `NEXT_PUBLIC_` — voir ADR-0002).

## Commandes

```bash
pnpm dev              # développement (port 3010)
pnpm typecheck        # tsc --noEmit
pnpm lint             # eslint .
pnpm test             # vitest
pnpm test:coverage    # vitest avec couverture
pnpm storybook        # catalogue de composants (port 6007)
pnpm api:types        # régénère src/lib/api/generated.ts depuis openapi.json
```

`src/lib/api/generated.ts` est généré depuis `openapi.json` — ne pas
l'éditer à la main.

## État actuel (Phase 0 — socle)

- Scaffold Next.js App Router, TypeScript strict, Tailwind v4 (tokens dans
  `src/app/globals.css`).
- Proxy BFF (`src/app/api/[...chemin]/route.ts`) avec renouvellement
  automatique du jeton (access + refresh en rotation) — voir ADR-0002.
- `lib/api/{backend,client,query-keys,response-interpreter,types}.ts`,
  `lib/auth/{cookie,session,permissions}.ts`, `lib/format/index.ts`.
- `src/proxy.ts` (convention Next.js 16), i18n (`next-intl`, `fr` uniquement), providers (Query,
  thème, `<Toaster>`), `AppShell` minimal, pages publiques/authentifiées
  placeholder.

**Phase 1 à venir** (composants transverses, voir `docs/socle-frontend.md`
§9) : `DataTable`, `Can`, `StatusBadge` + `config/status-registry.ts`,
`AsyncBoundary`, primitives shadcn vague 1, validées sur un premier écran
réel (`GET /packages`).

## Documentation

- `CLAUDE.md` — point d'entrée pour tout contributeur, humain ou agent.
- `docs/socle-frontend.md` — décisions actées, couche data, conventions.
- `docs/design-system.md` — tokens, comportement, catalogue de composants.
- `docs/contrat-api.md` — état réel du contrat API.
- `docs/architecture.md`, `docs/coding-rules-frontend.md`, `docs/testing.md`,
  `docs/workflow.md`, `docs/adr/`.
