"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { RoleProvider } from "@/lib/auth/role-context";
import type { Role } from "@/lib/auth/permissions";

/**
 * Providers globaux — Query, thème, toasts, rôle courant. `next-intl` n'a
 * pas besoin d'entrer ici : `NextIntlClientProvider` est posé dans
 * `layout.tsx`, au même niveau que ce composant, pas à l'intérieur (voir
 * `docs/design-system.md` § Toasts : le `<Toaster>` doit fonctionner
 * identiquement sur l'espace authentifié et les écrans publics).
 */
export function Providers({
  role,
  children,
}: {
  role: Role | undefined;
  children: ReactNode;
}) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            retry: 1,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <RoleProvider role={role}>
          {children}
          <Toaster richColors position="top-right" />
        </RoleProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
