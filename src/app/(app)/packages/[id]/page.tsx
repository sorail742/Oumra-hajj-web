import { DetailForfait } from "./DetailForfait";

/**
 * Détail public d'un forfait (`GET /packages/:id`, `@Public()`) — sous le
 * préfixe `/packages`, déjà public dans `src/proxy.ts`. Aucun écran de
 * gestion authentifié ne vit sous ce préfixe (voir le commentaire de
 * `PREFIXES_PUBLIC_CONTENU`).
 */
export default async function PackageDetailPage({
  params,
}: Readonly<{ params: Promise<{ id: string }> }>) {
  const { id } = await params;
  return <DetailForfait id={id} />;
}
