"use client";

import { useTranslations } from "next-intl";
import { CreateGroupDialog } from "@/features/groups/components/CreateGroupDialog";
import { useMyPackages } from "@/features/packages/api/use-my-packages";

/**
 * Compose deux domaines (forfaits de l'agence → création de groupe) :
 * rôle d'un fichier de page, jamais d'un `features/*` (règle 2).
 */
export function CreerGroupe() {
  const t = useTranslations("groups.create");
  const { data: forfaits = [], isSuccess } = useMyPackages();

  return (
    <div className="flex flex-col items-end gap-1">
      <CreateGroupDialog
        forfaits={forfaits.map((f) => ({ id: f.id, title: f.title }))}
      />
      {isSuccess && forfaits.length === 0 && (
        <p className="text-muted-foreground text-xs">{t("noPackage")}</p>
      )}
    </div>
  );
}
