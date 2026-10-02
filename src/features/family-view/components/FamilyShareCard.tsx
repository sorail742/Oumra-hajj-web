"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { HeartHandshake } from "lucide-react";
import { toast } from "sonner";
import {
  cheminVueFamille,
  useFamilyLink,
  useRegenererLien,
} from "../api/use-family-view";
import { CopyButton } from "@/components/shared/CopyButton";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";

/**
 * « Partager avec ma famille » (ticket #75) : lien absolu à copier,
 * régénération confirmée qui invalide l'ancien lien. Le proche ne voit ni
 * documents ni paiements.
 */
function Regenerer({ bookingId }: Readonly<{ bookingId: string }>) {
  const t = useTranslations("familyView.share");
  const tc = useTranslations("common");
  const [ouvert, setOuvert] = useState(false);
  const regeneration = useRegenererLien(bookingId);

  async function regenerer() {
    try {
      await regeneration.mutateAsync();
      toast.success(t("regenerated"));
      setOuvert(false);
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm">
          {t("regenerate")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("regenerateTitle")}</DialogTitle>
          <DialogDescription>{t("regenerateBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            disabled={regeneration.isPending}
            onClick={() => {
              regenerer().catch(() => undefined);
            }}
          >
            {t("regenerateConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function FamilyShareCard({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("familyView.share");
  const { data: lien, isPending, isError } = useFamilyLink(bookingId);

  if (isError) {
    return null;
  }
  const adresse = lien
    ? `${globalThis.location.origin}${cheminVueFamille(lien.token)}`
    : null;

  return (
    <section
      aria-labelledby="partage-famille"
      className="bg-card space-y-3 rounded-xl border p-5"
    >
      <h2
        id="partage-famille"
        className="flex items-center gap-2 text-base font-semibold"
      >
        <HeartHandshake aria-hidden className="text-primary size-5" />
        {t("title")}
      </h2>
      <p className="text-muted-foreground text-sm">{t("body")}</p>
      {isPending || !adresse ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-muted min-w-0 flex-1 truncate rounded-md px-3 py-2 font-mono text-xs">
            {adresse}
          </span>
          <CopyButton value={adresse} label={t("copy")} />
          <Regenerer bookingId={bookingId} />
        </div>
      )}
    </section>
  );
}
