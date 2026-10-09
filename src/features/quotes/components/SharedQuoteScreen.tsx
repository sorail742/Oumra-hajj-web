"use client";

import { useTranslations } from "next-intl";
import { Check, X } from "lucide-react";
import { toast } from "sonner";
import { useDevisPartage, useRepondreDevis } from "../api/use-quotes";
import { statutAffiche, type SharedQuote } from "../api/schemas";
import { QuoteLinesTable } from "./QuoteLinesTable";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { ConfirmDialog } from "@/components/shared/ConfirmDialog";
import { DetailSkeleton } from "@/components/shared/DetailSkeleton";
import { EmptyState } from "@/components/shared/EmptyState";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTelephone, lienTelephone } from "@/lib/format";

/**
 * Devis reçu par lien (idée #49), sans compte : le client le lit et
 * l'accepte ou le refuse, une fois, tant qu'il est valable.
 */
export function SharedQuoteScreen({ token }: Readonly<{ token: string }>) {
  const t = useTranslations("quotes.shared");
  const query = useDevisPartage(token);
  if (query.isError) {
    return (
      <EmptyState title={t("notFoundTitle")} description={t("notFound")} />
    );
  }
  return (
    <AsyncBoundary
      query={query}
      skeleton={<DetailSkeleton />}
      isEmpty={() => false}
    >
      {(devis) => <Devis devis={devis} token={token} />}
    </AsyncBoundary>
  );
}

function Devis({
  devis,
  token,
}: Readonly<{ devis: SharedQuote; token: string }>) {
  const t = useTranslations("quotes.shared");
  const reponse = useRepondreDevis(token);
  const ouvert = devis.status === "sent" && !devis.expired;

  async function repondre(accepte: boolean) {
    try {
      await reponse.mutateAsync(accepte);
      toast.success(accepte ? t("accepted") : t("declined"));
    } catch (erreur) {
      toast.error(t("error"));
      throw erreur;
    }
  }

  return (
    <div className="space-y-6">
      <header className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="font-mono text-sm">{devis.number}</p>
          <StatusBadge kind="quote" value={statutAffiche(devis)} />
        </div>
        <h1 className="text-xl font-semibold">
          {t("title", { client: devis.clientName })}
        </h1>
        <p className="text-muted-foreground text-sm">
          {t("issuer", { agency: devis.issuer.name })} ·{" "}
          <a
            href={lienTelephone(devis.issuer.phone)}
            className="text-primary font-mono"
          >
            {formatTelephone(devis.issuer.phone)}
          </a>
        </p>
        <p className="text-sm">
          {t("pilgrims", { count: devis.pilgrimsCount })}
          {devis.packageTitle ? ` · ${devis.packageTitle}` : ""}
        </p>
      </header>

      <QuoteLinesTable totaux={devis} />

      {devis.conditions && (
        <section className="space-y-1">
          <h2 className="font-medium">{t("conditions")}</h2>
          <p className="text-sm whitespace-pre-line">{devis.conditions}</p>
        </section>
      )}

      <p className="text-sm tabular-nums">
        {t("validUntil", { date: formatDate(devis.validUntil) })}
      </p>

      {ouvert ? (
        <div className="flex flex-wrap gap-2">
          <ConfirmDialog
            trigger={
              <Button>
                <Check aria-hidden className="size-4" />
                {t("accept")}
              </Button>
            }
            title={t("acceptTitle")}
            description={t("acceptDescription")}
            confirmLabel={t("accept")}
            enCours={reponse.isPending}
            onConfirm={() => repondre(true)}
          />
          <ConfirmDialog
            trigger={
              <Button variant="outline">
                <X aria-hidden className="size-4" />
                {t("decline")}
              </Button>
            }
            title={t("declineTitle")}
            description={t("declineDescription")}
            confirmLabel={t("decline")}
            destructive
            enCours={reponse.isPending}
            onConfirm={() => repondre(false)}
          />
        </div>
      ) : (
        <p className="text-muted-foreground text-sm">
          {devis.expired
            ? t("expired")
            : t("answered", {
                date: devis.respondedAt ? formatDate(devis.respondedAt) : "",
              })}
        </p>
      )}
    </div>
  );
}
