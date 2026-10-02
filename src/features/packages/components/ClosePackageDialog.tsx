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
import { useCloturerForfait } from "../api/use-my-packages";

/** Confirmation avant `PATCH /packages/:id/close` — action sans retour. */
export function ClosePackageDialog({
  packageId,
}: Readonly<{ packageId: string }>) {
  const t = useTranslations("packages.manage");
  const cloture = useCloturerForfait();
  const [ouvert, setOuvert] = useState(false);

  async function cloturer() {
    try {
      await cloture.mutateAsync(packageId);
      toast.success(t("closed"));
      setOuvert(false);
    } catch {
      toast.error(t("closeError"));
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
          {t("close")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("closeConfirmTitle")}</DialogTitle>
          <DialogDescription>{t("closeConfirmBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="secondary" onClick={() => setOuvert(false)}>
            {t("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={cloture.isPending}
            onClick={() => {
              cloturer().catch(() => undefined);
            }}
          >
            {t("closeConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
