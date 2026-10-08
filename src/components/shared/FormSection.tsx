import type { ReactNode } from "react";

/**
 * Bloc titré d'un long formulaire (forfait, profil…) : titre, aide
 * facultative, champs. Partagé pour qu'aucun `features/*` ne le recopie.
 */
export function FormSection({
  titre,
  aide,
  children,
}: Readonly<{ titre: string; aide?: string; children: ReactNode }>) {
  return (
    <section className="bg-card space-y-5 rounded-lg border p-6 shadow-(--shadow-card)">
      <div className="space-y-1">
        <h2 className="text-lg font-semibold">{titre}</h2>
        {aide && <p className="text-muted-foreground text-sm">{aide}</p>}
      </div>
      {children}
    </section>
  );
}
