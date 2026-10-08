// Copie le Web Worker de MapLibre (et le module partagé qu'il importe)
// dans `public/`, sous un dossier versionné — voir ADR-0007.
//
// MapLibre v6 calcule l'adresse de son worker à l'exécution
// (`new URL("./maplibre-gl-worker.mjs", import.meta.url)`) : une fois le
// code empaqueté par Next, ce fichier n'existe plus à côté. La carte lui
// indique donc l'adresse de cette copie (`setWorkerUrl`). Lancé avant
// `next dev` et `next build` ; le dossier copié est ignoré par git.
import { copyFileSync, mkdirSync, readFileSync } from "node:fs";
import { createRequire } from "node:module";
import { dirname, join } from "node:path";

const require = createRequire(import.meta.url);
const racinePaquet = dirname(require.resolve("maplibre-gl/package.json"));
const { version } = JSON.parse(
  readFileSync(join(racinePaquet, "package.json"), "utf8"),
);
const cible = join("public", "vendor", "maplibre-gl", version);

mkdirSync(cible, { recursive: true });
for (const fichier of ["maplibre-gl-worker.mjs", "maplibre-gl-shared.mjs"]) {
  copyFileSync(join(racinePaquet, "dist", fichier), join(cible, fichier));
}
