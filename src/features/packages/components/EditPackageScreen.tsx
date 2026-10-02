"use client";

import { AsyncBoundary } from "@/components/shared/AsyncBoundary";
import { Skeleton } from "@/components/ui/skeleton";
import { usePackage } from "../api/use-packages";
import { PackageForm } from "./PackageForm";

/** Charge le forfait (`GET /packages/:id`) puis le formulaire pré-rempli. */
export function EditPackageScreen({ id }: Readonly<{ id: string }>) {
  const query = usePackage(id);
  return (
    <AsyncBoundary
      query={query}
      skeleton={<Skeleton className="h-96 max-w-3xl rounded-xl" />}
    >
      {(forfait) => <PackageForm key={forfait.id} forfait={forfait} />}
    </AsyncBoundary>
  );
}
