"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { z } from "zod";
import { api } from "@/lib/api/client";
import { keys } from "@/lib/api/query-keys";
import { useRole } from "@/lib/auth/role-context";
import { agencySchema, type Agency } from "./schemas";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function useAgencies() {
  const role = useRole();
  return useQuery({
    queryKey: keys.agencies.list({}),
    queryFn: async () => {
      const data = await api.get<unknown>("/api/agencies");
      return z.array(agencySchema).parse(data);
    },
    enabled: role === "admin",
  });
}

export function useApproveAgency() {
  const queryClient = useQueryClient();
  const t = useTranslations("agencies.actions");

  return useMutation({
    mutationFn: async (id: string) => {
      await api.patch(`/api/agencies/${id}/approve`);
    },
    onSuccess: () => {
      toast.success(t("approveSuccess"));
      queryClient.invalidateQueries({ queryKey: keys.agencies.all });
    },
    onError: () => {
      toast.error(t("approveError"));
    },
  });
}

export function useRejectAgency() {
  const queryClient = useQueryClient();
  const t = useTranslations("agencies.actions");

  return useMutation({
    mutationFn: async ({ id, reason }: { id: string; reason: string }) => {
      await api.patch(`/api/agencies/${id}/reject`, { reason });
    },
    onSuccess: () => {
      toast.success(t("rejectSuccess"));
      queryClient.invalidateQueries({ queryKey: keys.agencies.all });
    },
    onError: () => {
      toast.error(t("rejectError"));
    },
  });
}
