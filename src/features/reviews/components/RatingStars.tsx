import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

export function RatingStars({ rating }: { rating: number }) {
  return (
    <span
      className="inline-flex items-center gap-0.5"
      role="img"
      aria-label={`${rating} sur 5`}
    >
      {Array.from({ length: 5 }, (_, i) => (
        <Star
          key={i}
          aria-hidden
          className={cn(
            "size-3.5",
            i < rating ? "fill-accent text-accent" : "text-muted-foreground",
          )}
        />
      ))}
    </span>
  );
}
