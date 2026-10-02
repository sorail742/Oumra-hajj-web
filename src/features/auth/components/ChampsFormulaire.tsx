"use client";

import type { Control, FieldPath, FieldValues } from "react-hook-form";
import { z } from "zod";
import {
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { ChampMotDePasse } from "./champs";

/** Adresse e-mail saisie : espaces retirés, format vérifié. */
export function schemaEmail(message: string) {
  return z.string().trim().pipe(z.email(message));
}

/** Champ e-mail des formulaires d'authentification (connexion, oubli). */
export function ChampEmail<T extends FieldValues>({
  control,
  name,
  label,
}: Readonly<{ control: Control<T>; name: FieldPath<T>; label: string }>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <Input
              {...field}
              type="email"
              autoComplete="email"
              inputMode="email"
              className="h-(--size-touch)"
            />
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

/** Nouveau mot de passe (réinitialisation), avec aide facultative. */
export function ChampNouveauMotDePasse<T extends FieldValues>({
  control,
  name,
  label,
  aide,
}: Readonly<{
  control: Control<T>;
  name: FieldPath<T>;
  label: string;
  aide?: string;
}>) {
  return (
    <FormField
      control={control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <ChampMotDePasse {...field} autoComplete="new-password" />
          </FormControl>
          {aide && <FormDescription>{aide}</FormDescription>}
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
