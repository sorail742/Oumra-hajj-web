"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Check, Copy } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

/**
 * Copie d'une référence de paiement ou d'un identifiant
 * (`docs/design-system.md`, catalogue Lot B). La valeur n'est jamais
 * journalisée.
 */
export function CopyButton({
  value,
  label,
}: {
  value: string;
  label?: string;
}) {
  const t = useTranslations("common");
  const [copie, setCopie] = useState(false);

  useEffect(() => {
    if (!copie) return;
    const minuterie = setTimeout(() => setCopie(false), 2000);
    return () => clearTimeout(minuterie);
  }, [copie]);

  async function copier() {
    try {
      await navigator.clipboard.writeText(value);
      setCopie(true);
      toast.success(t("copySuccess"));
    } catch {
      toast.error(t("copyError"));
    }
  }

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={copier}
      aria-label={label ?? t("copy")}
    >
      {copie ? (
        <Check className="size-4" aria-hidden />
      ) : (
        <Copy className="size-4" aria-hidden />
      )}
    </Button>
  );
}
