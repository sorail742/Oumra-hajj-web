"use client";

import { useTranslations } from "next-intl";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";

/**
 * Impression du document affiché — ou « Enregistrer en PDF » depuis la
 * boîte d'impression du navigateur. La coquille (navigation, en-tête) est
 * masquée à l'impression (`globals.css` § Impression).
 */
export function PrintButton() {
  const t = useTranslations("common");
  return (
    <Button
      variant="outline"
      onClick={() => window.print()}
      className="print:hidden"
    >
      <Printer aria-hidden className="size-4" />
      {t("print")}
    </Button>
  );
}
