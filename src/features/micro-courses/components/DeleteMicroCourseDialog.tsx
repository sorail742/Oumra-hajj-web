"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { useSupprimerCours } from "../api/use-micro-courses";
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

/** Suppression confirmée d'un micro-cours (ticket #83), retour au catalogue. */
export function DeleteMicroCourseDialog({
  id,
  title,
}: Readonly<{ id: string; title: string }>) {
  const t = useTranslations("microCourses.manage");
  const tc = useTranslations("common");
  const router = useRouter();
  const [ouvert, setOuvert] = useState(false);
  const suppression = useSupprimerCours(id);

  async function supprimer() {
    try {
      await suppression.mutateAsync();
      toast.success(t("deleted"));
      setOuvert(false);
      router.push("/micro-courses");
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
          className="text-destructive hover:text-destructive"
        >
          {t("delete")}
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-(--dialog-sm)">
        <DialogHeader>
          <DialogTitle>{t("deleteTitle", { title })}</DialogTitle>
          <DialogDescription>{t("deleteBody")}</DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOuvert(false)}>
            {tc("cancel")}
          </Button>
          <Button
            variant="destructive"
            disabled={suppression.isPending}
            onClick={() => {
              supprimer().catch(() => undefined);
            }}
          >
            {t("deleteConfirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
