import Link from "next/link";

/**
 * Page d'accueil minimale — pas un écran métier. Elle ne fait qu'orienter
 * vers l'un des deux parcours d'authentification (voir
 * `docs/socle-frontend.md` §5) : le middleware laisse `/` public et ne
 * redirige pas automatiquement un utilisateur déjà connecté depuis cette
 * page (voir `src/middleware.ts`).
 */
export default function Home() {
  return (
    <main className="flex min-h-svh flex-col items-center justify-center gap-6 p-6 text-center">
      <div className="space-y-2">
        <h1 className="text-xl font-semibold">Oumra & Hadj</h1>
        <p className="text-muted-foreground text-sm">
          Suivi de dossier pèlerin, agences et administration.
        </p>
      </div>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Link
          href="/otp"
          className="border-input hover:bg-muted rounded-md border px-4 py-2 text-sm"
        >
          Espace pèlerin / guide
        </Link>
        <Link
          href="/login"
          className="bg-primary text-primary-foreground hover:bg-primary-hover rounded-md px-4 py-2 text-sm"
        >
          Espace agence / admin
        </Link>
      </div>
    </main>
  );
}
