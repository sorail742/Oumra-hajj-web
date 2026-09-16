import { formatDateHeure, formatRelatif } from "@/lib/format";

/** « il y a 3 jours », `title` porte la date absolue — voir `docs/design-system.md` §4. */
export function RelativeTime({ iso }: { iso: string }) {
  return (
    <time dateTime={iso} title={formatDateHeure(iso)}>
      {formatRelatif(iso)}
    </time>
  );
}
