import "@testing-library/jest-dom/vitest";

// jsdom n'implémente pas `scrollIntoView` (voir ConversationView, qui
// l'appelle dans un effet) — sans ce bouchon, tout composant qui l'utilise
// fait planter le rendu en test avec une erreur sans rapport avec son
// comportement réel.
if (typeof Element !== "undefined" && !Element.prototype.scrollIntoView) {
  Element.prototype.scrollIntoView = () => {};
}
