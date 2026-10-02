import { Skeleton } from "@/components/ui/skeleton";

/** Squelette d'un écran de détail : un titre, puis un bloc de contenu. */
export function DetailSkeleton() {
  return (
    <div className="space-y-3">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-32 w-full" />
    </div>
  );
}
