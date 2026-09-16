/**
 * Connexion agence / admin — email + mot de passe (`POST /auth/agency/login`,
 * voir `docs/socle-frontend.md` §5). Placeholder structurel : le formulaire
 * réel (react-hook-form + zod) est un écran métier, hors du périmètre de ce
 * socle — voir `docs/socle-frontend.md` §1.
 */
export default function LoginPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-(--content-form) space-y-2 text-center">
        <h1 className="text-xl font-semibold">Connexion agence / admin</h1>
        <p className="text-muted-foreground text-sm">
          Formulaire email + mot de passe à construire (Phase 2).
        </p>
      </div>
    </main>
  );
}
