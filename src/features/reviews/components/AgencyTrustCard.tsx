import { useTranslations } from "next-intl";
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatNombre, formatPourcentage } from "@/lib/format";
import { TrustScoreBadge } from "./TrustScoreBadge";
import type { AgencyTrustScore } from "../api/schemas";

/**
 * `score`/`reviewAverage`/`completionRate` peuvent être `undefined` — une
 * agence neuve, pas une erreur. Affiché comme tel, jamais comme un zéro
 * (voir `docs/design-system.md` §7).
 */
export function AgencyTrustCard({
  trustScore,
}: {
  trustScore: AgencyTrustScore;
}) {
  const t = useTranslations("reviews");
  const estNouvelle =
    trustScore.score === undefined && trustScore.reviewAverage === undefined;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("trustCardTitle")}</CardTitle>
        <CardAction>
          <TrustScoreBadge badge={trustScore.badge} />
        </CardAction>
      </CardHeader>
      <CardContent>
        {estNouvelle ? (
          <p className="text-muted-foreground text-sm">{t("newAgency")}</p>
        ) : (
          <dl className="grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
            {trustScore.score !== undefined ? (
              <div>
                <dt className="text-muted-foreground text-2xs">{t("score")}</dt>
                <dd className="font-mono">{trustScore.score} / 100</dd>
              </div>
            ) : null}
            {trustScore.reviewAverage !== undefined ? (
              <div>
                <dt className="text-muted-foreground text-2xs">
                  {t("reviewAverage")}
                </dt>
                <dd className="font-mono">
                  {trustScore.reviewAverage.toFixed(1)} / 5
                </dd>
              </div>
            ) : null}
            <div>
              <dt className="text-muted-foreground text-2xs">
                {t("reviewCount")}
              </dt>
              <dd className="font-mono">
                {formatNombre(trustScore.reviewCount)}
              </dd>
            </div>
            {trustScore.completionRate !== undefined ? (
              <div>
                <dt className="text-muted-foreground text-2xs">
                  {t("completionRate")}
                </dt>
                <dd className="font-mono">
                  {formatPourcentage(trustScore.completionRate * 100)}
                </dd>
              </div>
            ) : null}
          </dl>
        )}
      </CardContent>
    </Card>
  );
}
