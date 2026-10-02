import { LandingPage } from "@/features/landing/components/LandingPage";

/**
 * Page d'accueil publique. Le middleware laisse `/` public et ne redirige
 * pas automatiquement un utilisateur déjà connecté (voir `src/proxy.ts`).
 */
export default function Home() {
  return <LandingPage />;
}
