import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

/**
 * Configuration ESLint à plat.
 *
 * `eslint-config-next` (Next 16+) exporte directement au format flat : pas
 * de `FlatCompat`, qui échoue sur les versions récentes avec une erreur de
 * structure circulaire peu explicite. Vérifier ce point si la version de
 * Next installée diffère sensiblement de celle utilisée pour écrire ce
 * fichier.
 */
const config = [
  ...nextCoreWebVitals,
  ...nextTypescript,

  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "node_modules/**",
      "storybook-static/**",
      "coverage/**",
      "next-env.d.ts",
      // Fichier généré depuis openapi.json — le linter n'a rien à y dire, et
      // ses erreurs se corrigent côté backend.
      "src/lib/api/generated.ts",
      // Matériel de référence du kit de démarrage, déjà copié dans src/ —
      // pas du code applicatif à linter deux fois.
      "oumra-hadj-web-kit/**",
    ],
  },

  {
    // `import/no-restricted-paths` doit résoudre les alias `@/*` du tsconfig
    // pour savoir dans quel feature vit un import. Sans ce résolveur, la
    // règle échoue au lieu de vérifier quoi que ce soit.
    settings: {
      "import/resolver": {
        typescript: { project: "./tsconfig.json" },
      },
    },
    rules: {
      // `any` interdit sous toute forme — règle du socle, vérifiée ici
      // plutôt que laissée à la revue.
      "@typescript-eslint/no-explicit-any": "error",

      // Convention standard : un paramètre préfixé `_` est intentionnellement
      // inutilisé (signature conservée pour une extension future, voir
      // `lib/api/backend.ts`), pas une erreur à corriger.
      "@typescript-eslint/no-unused-vars": [
        "warn",
        { argsIgnorePattern: "^_", varsIgnorePattern: "^_" },
      ],

      /**
       * 400 lignes maximum par fichier de code — voir ADR-0003 (dont
       * l'addendum du 2026-09-17). Non négociable : un fichier qui approche
       * la limite se découpe par responsabilité, jamais désactivé au cas
       * par cas. `skipBlankLines`/`skipComments` : recoupé contre
       * `smartsms-frontend`, qui a adopté la même règle et mesuré sur son
       * propre dépôt qu'un seuil comptant les commentaires pénalise
       * exactement la documentation abondante que ce projet encourage —
       * même raisonnement ici, sans reprendre leur sévérité `warn` (chez
       * eux un choix de migration sur une base existante de six fichiers
       * déjà hors seuil ; sans base existante ici, `error` s'applique dès
       * le premier jour).
       */
      "max-lines": [
        "error",
        { max: 400, skipBlankLines: true, skipComments: true },
      ],

      /**
       * Une imbrication au-delà de 4 niveaux signale une logique à
       * extraire — même ajout, même raisonnement que `smartsms-frontend`
       * (pas de `max-lines-per-function`/`complexity` : un composant React
       * est une fonction, son JSX les fait mentir).
       */
      "max-depth": ["warn", 4],

      /**
       * Un dossier `features/x` n'importe jamais depuis `features/y`.
       *
       * C'est la règle qui permet à plusieurs contributeurs de travailler en
       * parallèle sans conflit permanent. Ce qui est partagé remonte dans
       * `components/shared/` ou `lib/`. La faire respecter par ESLint plutôt
       * que par la discipline est ce qui la rend effective.
       */
      "import/no-restricted-paths": [
        "error",
        {
          zones: [
            {
              target: "./src/features/*",
              from: "./src/features/*",
              except: ["./"],
              message:
                "Un feature n'importe jamais depuis un autre feature. Remonter le code partagé dans components/shared/ ou lib/.",
            },
          ],
        },
      ],
    },
  },

  {
    // Un fichier de test long est souvent un fichier de test complet — voir
    // ADR-0003 (addendum du 2026-09-17), même exemption que smartsms-frontend.
    files: ["**/*.test.{ts,tsx}"],
    rules: {
      "max-lines": "off",
    },
  },

  {
    /**
     * `components/ui/` — primitives générées par shadcn, alignées sur
     * l'amont. Les découper compliquerait chaque mise à jour du générateur
     * pour un bénéfice nul : ce sont des définitions de variantes, pas de
     * la logique métier — même exemption que smartsms-frontend.
     */
    files: ["src/components/ui/**"],
    rules: {
      "max-lines": "off",
    },
  },
];

export default config;
