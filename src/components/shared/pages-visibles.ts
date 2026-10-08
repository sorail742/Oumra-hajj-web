/**
 * Numéros de page à afficher dans une pagination (index 0), avec des
 * ellipses (`"…"`) pour les plages masquées : toujours la première, la
 * dernière, et les voisines de la page courante — au plus 7 éléments.
 */
export type ElementPagination = number | "…";

export function pagesVisibles(
  courante: number,
  total: number,
): ElementPagination[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const debut = Math.max(1, Math.min(courante - 1, total - 5));
  const fin = Math.min(total - 2, Math.max(courante + 1, 4));
  const pages: ElementPagination[] = [0];
  if (debut > 1) pages.push("…");
  for (let i = debut; i <= fin; i += 1) pages.push(i);
  if (fin < total - 2) pages.push("…");
  pages.push(total - 1);
  return pages;
}
