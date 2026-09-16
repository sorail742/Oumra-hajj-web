import { cn } from "@/lib/utils";
import {
  statusEntry,
  type StatusKind,
  type Tone,
} from "@/config/status-registry";

/**
 * Seul composant qui donne une couleur à un statut d'API — voir
 * `config/status-registry.ts`. Jamais un mapping local dans un écran.
 */

const CLASSES_PAR_TON: Record<Tone, string> = {
  pending: "bg-state-pending-bg text-state-pending",
  progress: "bg-state-progress-bg text-state-progress",
  success: "bg-state-success-bg text-state-success",
  danger: "bg-state-danger-bg text-state-danger",
  warning: "bg-state-warning-bg text-state-warning",
};

export interface StatusBadgeProps {
  kind: StatusKind;
  value: string;
  className?: string;
}

export function StatusBadge({ kind, value, className }: StatusBadgeProps) {
  const { label, tone } = statusEntry(kind, value);

  return (
    <span
      className={cn(
        "rounded-sm px-2 py-0.5 text-2xs font-medium",
        CLASSES_PAR_TON[tone],
        className,
      )}
    >
      {label}
    </span>
  );
}
