import { useTranslations } from "next-intl";
import type { LucideIcon } from "lucide-react";
import { BadgeCheck, Check, MessageCircle, Smartphone } from "lucide-react";
import { cn } from "cn";

/**
 * Aperçu animé de l'espace pèlerin : un téléphone qui affiche un dossier en
 * cours, entouré de notifications qui flottent. Données explicitement
 * fictives (légende visible), aucune donnée d'identité ni de paiement réelle.
 */

const ETAPES = ["step1", "step2", "step3", "step4", "step5"] as const;
const ETAPES_FAITES = 4;

interface Notification {
  cle: "notifPayment" | "notifVisa" | "notifGroup";
  icone: LucideIcon;
  position: string;
  delai: string;
  mono?: boolean;
}

const NOTIFICATIONS: readonly Notification[] = [
  {
    cle: "notifPayment",
    icone: Smartphone,
    position: "-right-24 -top-4",
    delai: "landing-delay-2",
    mono: true,
  },
  {
    cle: "notifVisa",
    icone: BadgeCheck,
    position: "-right-28 top-56",
    delai: "landing-delay-4",
  },
  {
    cle: "notifGroup",
    icone: MessageCircle,
    position: "-left-24 -bottom-2",
    delai: "landing-delay-5",
  },
];

function CarteNotification({
  notification,
}: Readonly<{ notification: Notification }>) {
  const t = useTranslations("landing.mockup");
  const { cle, icone: Icone, position, delai, mono } = notification;
  return (
    <div
      className={cn(
        "absolute z-10 hidden w-60 xl:block",
        position,
        "animate-landing-fade-up",
        delai,
      )}
    >
      <div
        className={cn(
          "bg-card/95 shadow-float flex items-center gap-3 rounded-xl border p-3 backdrop-blur",
          "animate-landing-float",
          delai,
        )}
      >
        <span className="bg-primary-subtle text-primary inline-flex size-9 shrink-0 items-center justify-center rounded-lg">
          <Icone aria-hidden className="size-4" />
        </span>
        <div className="min-w-0">
          <p className="text-sm font-semibold">{t(`${cle}Title`)}</p>
          <p
            className={cn("text-muted-foreground text-xs", mono && "font-mono")}
          >
            {t(`${cle}Body`)}
          </p>
        </div>
      </div>
    </div>
  );
}

export function HeroMockup() {
  const t = useTranslations("landing.mockup");

  return (
    <figure className="relative mx-auto w-fit">
      {NOTIFICATIONS.map((notification) => (
        <CarteNotification key={notification.cle} notification={notification} />
      ))}

      <div className="animate-landing-float">
        <div className="bg-landing-silhouette shadow-float rounded-device p-2">
          <div className="bg-background text-foreground w-72 overflow-hidden rounded-[calc(var(--radius-device)-0.5rem)]">
            <div className="flex justify-center pt-2">
              <span className="bg-landing-silhouette h-1.5 w-16 rounded-full" />
            </div>

            <div className="space-y-5 p-5">
              <div className="space-y-1">
                <p className="text-muted-foreground text-xs">{t("greeting")}</p>
                <p className="text-lg font-semibold">{t("title")}</p>
                <span className="bg-primary-subtle text-primary inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium">
                  {t("countdown")}
                </span>
              </div>

              <div className="space-y-2">
                <p className="text-muted-foreground text-xs font-medium">
                  {t("progress")}
                </p>
                <div className="bg-muted h-2 overflow-hidden rounded-full">
                  <div className="h-full w-4/5">
                    <div className="bg-primary animate-landing-progress h-full origin-left rounded-full" />
                  </div>
                </div>
              </div>

              <ol className="space-y-3">
                {ETAPES.map((etape, index) => {
                  const faite = index < ETAPES_FAITES;
                  return (
                    <li key={etape} className="flex items-center gap-3">
                      <span
                        className={cn(
                          "inline-flex size-6 shrink-0 items-center justify-center rounded-full",
                          faite
                            ? "bg-state-success-bg text-state-success"
                            : "border-primary animate-landing-pulse border-2",
                        )}
                      >
                        {faite && <Check aria-hidden className="size-3.5" />}
                      </span>
                      <span
                        className={cn(
                          "text-sm",
                          faite
                            ? "text-foreground"
                            : "text-primary font-medium",
                        )}
                      >
                        {t(etape)}
                      </span>
                    </li>
                  );
                })}
              </ol>
            </div>
          </div>
        </div>
      </div>

      <figcaption className="text-landing-on-night-muted mt-6 text-center text-xs">
        {t("caption")}
      </figcaption>
    </figure>
  );
}
