import type { ReactElement } from "react";
import { render } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NextIntlClientProvider } from "next-intl";
import messages from "@/messages/fr.json";

/**
 * Rend un composant dans les providers de l'application (TanStack Query,
 * traductions `fr`) — un QueryClient neuf par appel, sans nouvel essai
 * automatique, pour qu'aucun test ne dépende du cache d'un autre.
 */
export function afficherAvecProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  return render(
    <QueryClientProvider client={queryClient}>
      <NextIntlClientProvider locale="fr" messages={messages}>
        {ui}
      </NextIntlClientProvider>
    </QueryClientProvider>,
  );
}
