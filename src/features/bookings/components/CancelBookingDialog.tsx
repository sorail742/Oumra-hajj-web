"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
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
import { useAnnulerReservation } from "../api/use-bookings";

/**
 * Annulation d'une réservation par le pèlerin (ticket #53) — action sans
 * retour, confirmée, qui rappelle la démarche de remboursement.
 */
export function CancelBookingDialog({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("bookings.cancel");
  const annulation = useAnnulerReservation(bookingId);
  const [ouvert, setOuvert] = useState(false);

  async function annuler() {
    try {
      await annulation.mutateAsync();
      toast.success(t("done"));
      setOuvert(false);
    } catch {
      toast.error(t("error"));
    }
  }

  return (
    <Dialog open={ouvert} onOpenChange={setOuvert}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="text-state-danger hover:bg-state-danger-bg"
        >
          {t("action")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("confirmTitle")}</DialogTitle>
          <DialogDescription>{t("confirmBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOuvert(false)}>
            {t("keep")}
          </Button>
          <Button
            variant="destructive"
            disabled={annulation.isPending}
            onClick={() => {
              annuler().catch(() => undefined);
            }}
          >
            {t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
