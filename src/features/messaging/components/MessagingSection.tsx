"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { ConversationView } from "./ConversationView";
import type { MessagingChannel } from "../api/schemas";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

/**
 * Composé au niveau de la page (`app/(app)/bookings/[id]/page.tsx`), pas
 * depuis `features/bookings` : un `features/x` n'importe jamais
 * `features/y` (voir `CLAUDE.md` règle 2) — la page reste le seul endroit
 * qui assemble plusieurs domaines.
 */
export function MessagingSection({ bookingId }: { bookingId: string }) {
  const t = useTranslations("messaging");
  const [canal, setCanal] = useState<MessagingChannel>("agency");

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-medium">{t("sectionTitle")}</h2>
        <div className="flex gap-1">
          {(["agency", "guide"] as const).map((c) => (
            <Button
              key={c}
              type="button"
              size="sm"
              variant={canal === c ? "default" : "outline"}
              className={cn(canal === c && "pointer-events-none")}
              onClick={() => setCanal(c)}
            >
              {c === "agency" ? t("channelAgency") : t("channelGuide")}
            </Button>
          ))}
        </div>
      </div>
      <ConversationView bookingId={bookingId} channel={canal} />
    </div>
  );
}
