import { configDefaults, defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./vitest.setup.ts"],
    // `e2e/` contient les tests Playwright (`pnpm test:e2e`, voir
    // `playwright.config.ts`) : ils pilotent un vrai navigateur et ne
    // s'exécutent pas sous Vitest/jsdom.
    exclude: [...configDefaults.exclude, "e2e/**"],
    globals: true,
    // `forks` (défaut) démarre un processus Node par fichier de test, donc
    // un jsdom par fichier — signalé à chaque exécution (« jsdom was
    // created N times, 45-84% of tracked time ») et responsable d'un crash
    // mémoire une fois la suite passée à une dizaine de fichiers. `vmThreads`
    // réutilise l'isolat V8 entre fichiers plutôt que d'en recréer un par
    // processus.
    pool: "vmThreads",
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
