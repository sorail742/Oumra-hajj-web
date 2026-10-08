"use client";

import { useTranslations } from "next-intl";
import { usePlanEpargne, type PlanEpargne } from "../api/use-savings-plan";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Money } from "@/components/shared/Money";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/format";
import { SavingsPlanForm } from "./SavingsPlanForm";

/**
 * Plan d'épargne d'une réservation (ticket 1) : cotisations automatiques
 * à intervalle régulier jusqu'au prix du forfait. Chaque échéance lance un
 * paiement Mobile Money à valider sur le téléphone, accompagné d'un
 * rappel — rien n'est débité sans validation du pèlerin.
 */
export function SavingsPlanCard({
  bookingId,
}: Readonly<{ bookingId: string }>) {
  const t = useTranslations("payments.savings");
  const query = usePlanEpargne(bookingId);

  return (
    <section className="space-y-4 rounded-lg border p-4 md:p-6">
      <div className="space-y-1">
        <h2 className="text-lg font-medium">{t("title")}</h2>
        <p className="text-muted-foreground text-sm">{t("description")}</p>
      </div>
      <AsyncBoundary
        query={query}
        skeleton={<Skeleton className="h-32 w-full" />}
        isEmpty={() => false}
      >
        {(plan: PlanEpargne | null) => (
          <div className="space-y-4">
            {plan && <Resume plan={plan} />}
            <SavingsPlanForm bookingId={bookingId} plan={plan} />
          </div>
        )}
      </AsyncBoundary>
    </section>
  );
}

function Resume({ plan }: Readonly<{ plan: PlanEpargne }>) {
  const t = useTranslations("payments.savings");
  const cotisations =
    plan.autoDeduct && plan.deductAmount
      ? Math.ceil(plan.targetAmount / plan.deductAmount)
      : null;

  return (
    <dl className="bg-muted grid gap-3 rounded-lg p-4 text-sm sm:grid-cols-3">
      <div>
        <dt className="text-muted-foreground">{t("target")}</dt>
        <dd className="font-semibold">
          <Money montant={plan.targetAmount} />
        </dd>
      </div>
      <div>
        <dt className="text-muted-foreground">{t("next")}</dt>
        <dd className="font-semibold">
          {plan.autoDeduct && plan.nextDeductDate
            ? formatDate(plan.nextDeductDate)
            : t("paused")}
        </dd>
      </div>
      {cotisations !== null && (
        <div>
          <dt className="text-muted-foreground">{t("count")}</dt>
          <dd className="font-semibold">
            {t("countValue", { count: cotisations })}
          </dd>
        </div>
      )}
    </dl>
  );
}
