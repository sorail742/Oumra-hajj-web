/**
 * Conventional Commits, portée = nom de feature — voir CLAUDE.md
 * § Style de contribution.
 *
 * CommonJS : `package.json` ne déclare pas `"type": "module"`, donc ce
 * fichier `.js` est chargé par Node comme CommonJS. Un `export default`
 * ESM ici se charge silencieusement en un module vide côté commitlint (pas
 * d'erreur de syntaxe, juste des règles absentes) — piège à ne pas
 * reproduire.
 */
module.exports = {
  extends: ["@commitlint/config-conventional"],
};
