"use client";

import { useMyGuides } from "@/features/agencies/api/use-my-guides";
import { AssignGuideSelect } from "@/features/groups/components/AssignGuideSelect";
import { GroupDetailScreen } from "@/features/groups/components/GroupDetailScreen";

/**
 * Compose deux domaines (guides de l'agence → assignation au groupe, #64) :
 * rôle d'un fichier de page, jamais d'un `features/*` (règle 2). Seuls les
 * guides actifs sont proposés.
 */
function AssignerGuide({
  groupId,
  guideId,
}: Readonly<{ groupId: string; guideId?: string }>) {
  const { data: guides = [], isSuccess } = useMyGuides();
  if (!isSuccess) return null;

  return (
    <AssignGuideSelect
      groupId={groupId}
      guideId={guideId}
      guides={guides
        .filter((g) => g.isActive)
        .map((g) => ({ id: g.id, label: g.fullName }))}
    />
  );
}

/** Détail du groupe avec l'assignation du guide branchée (rôle agence). */
export function GroupDetail({ id }: Readonly<{ id: string }>) {
  return (
    <GroupDetailScreen
      id={id}
      guideAction={(group) => (
        <AssignerGuide groupId={group.id} guideId={group.guideId} />
      )}
    />
  );
}
