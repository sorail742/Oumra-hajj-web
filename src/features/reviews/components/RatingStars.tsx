import { useTranslations } from "next-intl";
import { Star } from "lucide-react";
import { cn } from "@/lib/utils";

const NOTES = [1, 2, 3, 4, 5] as const;

/** Note en lecture seule ; le texte « 4 sur 5 » est lu, les étoiles masquées. */
export function RatingStars({ rating }: Readonly<{ rating: number }>) {
  const t = useTranslations("reviews");
  return (
    <span className="inline-flex items-center gap-0.5">
      <span className="sr-only">{t("ratingLabel", { rating })}</span>
      {NOTES.map((note) => (
        <Star
          key={note}
          aria-hidden
          className={cn(
            "size-3.5",
            note <= rating
              ? "fill-accent text-accent"
              : "text-muted-foreground",
          )}
        />
      ))}
    </span>
  );
}
