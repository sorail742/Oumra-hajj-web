"use client";

import { useState, type ReactNode } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";

/**
 * Providers globaux — Query, thème, toasts. `next-intl` n'a pas besoin
 * d'entrer ici : `NextIntlClientProvider` est posé dans `layout.tsx`, au
 * même niveau que ce composant, pas à l'intérieur (voir
 * `docs/design-system.md` § Toasts : le `<Toaster>` doit fonctionner
 * identiquement sur l'espace authentifié et les écrans publics).
 */
export function Providers({ children }: { children: ReactNode }) {
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
        {children}
        <Toaster richColors position="top-right" />
      </ThemeProvider>
    </QueryClientProvider>
  );
}
