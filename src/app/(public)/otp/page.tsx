/**
 * Connexion pèlerin / guide — téléphone + OTP SMS
 * (`POST /auth/otp/request`, `POST /auth/otp/verify`, voir
 * `docs/socle-frontend.md` §5). Placeholder structurel — le formulaire réel
 * est un écran métier, hors du périmètre de ce socle.
 */
export default function OtpPage() {
  return (
    <main className="flex min-h-svh items-center justify-center p-6">
      <div className="w-full max-w-(--content-form) space-y-2 text-center">
        <h1 className="text-xl font-semibold">Connexion pèlerin / guide</h1>
        <p className="text-muted-foreground text-sm">
          Parcours téléphone + code OTP à construire (Phase 2).
        </p>
      </div>
    </main>
  );
}
