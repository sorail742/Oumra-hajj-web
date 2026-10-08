"use client";

import { useQuery } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { directoryEntrySchema } from "./schemas";

/** `GET /directory/agencies` — public (idée #71). */
export function useAgencyDirectory() {
  return useQuery({
    queryKey: keys.directory.agencies(),
    queryFn: async () =>
      z
        .array(directoryEntrySchema)
        .parse(await api.get<unknown>("/api/directory/agencies")),
  });
}
