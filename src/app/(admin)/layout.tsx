import type { ReactNode } from "react";
import { AppShell } from "@/components/layout/AppShell";

/** Espace d'administration : même coquille que l'espace authentifié. */
export default function AdminGroupLayout({
  children,
}: Readonly<{ children: ReactNode }>) {
  return <AppShell>{children}</AppShell>;
}
