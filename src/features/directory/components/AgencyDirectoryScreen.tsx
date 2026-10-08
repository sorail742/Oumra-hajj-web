"use client";

import { useState, type ReactNode } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { ArrowRight, BadgeCheck, MapPin, Search, Star } from "lucide-react";
import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { EmptyState } from "@/components/shared/EmptyState";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { formatDate, formatNote } from "@/lib/format";
import { useAgencyDirectory } from "../api/use-directory";
import type { DirectoryEntry } from "../api/schemas";

/**
 * Annuaire public des agences validées (idée #71, volet plateforme) : le
 * pèlerin vérifie une agence avant de payer. Recherche par nom locale
 * (liste courte, chargée en une fois). Le badge de confiance est fourni
 * par la page (`badge`, règle 2).
 */
function normaliser(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

export function AgencyDirectoryScreen({
  badge,
}: Readonly<{ badge: (agence: DirectoryEntry) => ReactNode }>) {
  const t = useTranslations("directory");
  const query = useAgencyDirectory();
  const [recherche, setRecherche] = useState("");

  return (
    <div className="space-y-5">
      <div className="relative max-w-sm">
        <Search
          aria-hidden
          className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
        />
        <Input
          type="search"
          value={recherche}
          onChange={(e) => setRecherche(e.target.value)}
          placeholder={t("search")}
          aria-label={t("search")}
          className="h-(--size-touch) pl-9"
        />
      </div>
      <AsyncBoundary
        query={query}
        skeleton={
          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
            {["a", "b", "c"].map((c) => (
              <Skeleton key={c} className="h-44 rounded-lg" />
            ))}
          </div>
        }
        empty={
          <div className="bg-card rounded-lg border">
            <EmptyState title={t("emptyTitle")} />
          </div>
        }
      >
        {(agences) => {
          const visibles = agences.filter((a) =>
            normaliser(a.legalName).includes(normaliser(recherche.trim())),
          );
          if (visibles.length === 0) {
            return (
              <p className="text-muted-foreground text-sm">{t("noMatch")}</p>
            );
          }
          return (
            <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
              {visibles.map((agence) => (
                <li
                  key={agence.id}
                  className="bg-card flex flex-col gap-3 rounded-lg border p-5 shadow-(--shadow-card)"
                >
                  <div className="flex items-start justify-between gap-2">
                    <h2 className="font-semibold">{agence.legalName}</h2>
                    {badge(agence)}
                  </div>
                  <dl className="text-muted-foreground space-y-1.5 text-sm">
                    {agence.address && (
                      <div className="flex items-center gap-2">
                        <MapPin aria-hidden className="size-4 shrink-0" />
                        <dd>{agence.address}</dd>
                      </div>
                    )}
                    {agence.validatedAt && (
                      <div className="flex items-center gap-2">
                        <BadgeCheck
                          aria-hidden
                          className="text-primary size-4 shrink-0"
                        />
                        <dd>
                          {t("validatedOn", {
                            date: formatDate(agence.validatedAt),
                          })}
                        </dd>
                      </div>
                    )}
                    <div className="flex items-center gap-2">
                      <Star aria-hidden className="size-4 shrink-0" />
                      <dd>
                        {agence.trustScore.reviewAverage === undefined
                          ? t("noReviews")
                          : t("reviews", {
                              note: formatNote(agence.trustScore.reviewAverage),
                              count: agence.trustScore.reviewCount,
                            })}
                      </dd>
                    </div>
                  </dl>
                  <div className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-1">
                    <Link
                      href={`/agencies/${agence.id}`}
                      className="text-primary inline-flex items-center gap-1 text-sm font-medium hover:underline"
                    >
                      {t("profile")}
                      <ArrowRight aria-hidden className="size-4" />
                    </Link>
                    <Link
                      href={`/packages?agencyId=${encodeURIComponent(agence.id)}`}
                      className="text-primary text-sm font-medium hover:underline"
                    >
                      {t("packages")}
                    </Link>
                  </div>
                </li>
              ))}
            </ul>
          );
        }}
      </AsyncBoundary>
    </div>
  );
}
