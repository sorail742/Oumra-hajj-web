import { Skeleton } from "@/components/ui/skeleton";

/** Squelette aux dimensions du tableau réel — voir `CLAUDE.md` règle 6. */
export function TableSkeleton({ rows = 8 }: { rows?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: rows }, (_, i) => (
        <Skeleton key={i} className="h-(--row-height-default) w-full" />
      ))}
    </div>
  );
}
