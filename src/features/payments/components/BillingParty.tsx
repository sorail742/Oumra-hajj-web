import { useTranslations } from "next-intl";
import type { BillingParty } from "../api/use-billing";
import { formatTelephone } from "@/lib/format";

/** Bloc d'une partie (agence ou pèlerin) sur une facture ou un contrat. */
export function BillingPartyBlock({
  titre,
  partie,
  mentionsLegales = false,
}: Readonly<{
  titre: string;
  partie: BillingParty;
  mentionsLegales?: boolean;
}>) {
  const t = useTranslations("billing");
  return (
    <div className="space-y-0.5 text-sm">
      <p className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
        {titre}
      </p>
      <p className="font-semibold">{partie.name}</p>
      {partie.address && (
        <p className="whitespace-pre-line">{partie.address}</p>
      )}
      {partie.phone && (
        <p className="font-mono">{formatTelephone(partie.phone)}</p>
      )}
      {partie.email && <p>{partie.email}</p>}
      {mentionsLegales && (
        <>
          <p>
            {t("taxId")} :{" "}
            <span className="font-mono">{partie.taxId ?? t("missing")}</span>
          </p>
          <p>
            {t("tradeRegister")} :{" "}
            <span className="font-mono">
              {partie.tradeRegister ?? t("missing")}
            </span>
          </p>
        </>
      )}
    </div>
  );
}
