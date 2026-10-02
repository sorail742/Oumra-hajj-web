"use client";

import { useState, type ComponentProps } from "react";
import { useTranslations } from "next-intl";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

/** Éléments communs aux formulaires d'authentification. */

export function ChampMotDePasse(props: ComponentProps<typeof Input>) {
  const t = useTranslations("auth.common");
  const [visible, setVisible] = useState(false);
  return (
    <div className="relative">
      <Input
        {...props}
        type={visible ? "text" : "password"}
        className="h-(--size-touch) pr-11"
      />
      <button
        type="button"
        onClick={() => setVisible((v) => !v)}
        aria-label={visible ? t("hidePassword") : t("showPassword")}
        aria-pressed={visible}
        className="text-muted-foreground hover:text-foreground absolute inset-y-0 right-0 inline-flex w-11 items-center justify-center rounded-r-md"
      >
        {visible ? (
          <EyeOff aria-hidden className="size-4" />
        ) : (
          <Eye aria-hidden className="size-4" />
        )}
      </button>
    </div>
  );
}

export function BoutonEnvoi({
  enCours,
  children,
}: Readonly<{ enCours: boolean; children: string }>) {
  const t = useTranslations("auth.common");
  return (
    <Button
      type="submit"
      disabled={enCours}
      className="bg-primary hover:bg-primary-hover h-(--size-touch) w-full text-base"
    >
      {enCours ? (
        <>
          <Loader2 aria-hidden className="size-4 animate-spin" />
          {t("submitting")}
        </>
      ) : (
        children
      )}
    </Button>
  );
}

export function BandeauErreur({
  message,
}: Readonly<{ message: string | null }>) {
  if (!message) {
    return null;
  }
  return (
    <p
      role="alert"
      className="bg-state-danger-bg text-state-danger rounded-md px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}

export function BandeauSucces({ message }: Readonly<{ message: string }>) {
  return (
    <p
      role="status"
      className="bg-state-success-bg text-state-success rounded-md px-3 py-2 text-sm"
    >
      {message}
    </p>
  );
}
