"use client";

import { useTranslations } from "next-intl";
import { SignedUrlButton } from "@/components/shared/SignedUrlButton";
import { useDocumentAccessUrl } from "../api/use-documents";

/**
 * Consultation d'un document pèlerin via URL signée fraîche à chaque clic
 * (`useDocumentAccessUrl` est une mutation) — voir `SignedUrlButton`.
 */
export function DocumentAccessButton({ documentId }: { documentId: string }) {
  const t = useTranslations("documents");
  const { mutateAsync, isPending } = useDocumentAccessUrl();

  return (
    <SignedUrlButton
      obtenirUrl={async () => (await mutateAsync(documentId)).url}
      isPending={isPending}
      labels={{
        view: t("view"),
        opening: t("opening"),
        openError: t("openError"),
      }}
    />
  );
}
