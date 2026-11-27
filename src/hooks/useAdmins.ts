"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";

export type Me = { id: string; email: string; name: string; avatarUrl: string };
export type Member = Me & { lastLoginAt: string | null; createdAt: string };

const body = (b: unknown) => JSON.stringify(b);

export const useMe = () => useQuery({ queryKey: ["me"], queryFn: () => api("/api/admin/me") as Promise<Me> });
export const useAdmins = () => useQuery({ queryKey: ["admins"], queryFn: () => api("/api/admin/admins") as Promise<Member[]> });

function useRefresh() {
  const qc = useQueryClient();
  return () => Promise.all([qc.invalidateQueries({ queryKey: ["me"] }), qc.invalidateQueries({ queryKey: ["admins"] })]);
}

export function useUpdateMe() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (v: { name?: string; email?: string; newPassword?: string; currentPassword?: string }) =>
      api("/api/admin/me", { method: "PATCH", body: body(v) }),
    onSuccess: refresh,
  });
}

export function useUploadAvatar() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: async (file: File) => {
      const fd = new FormData();
      fd.append("file", file);
      const r = await fetch("/api/admin/avatar", { method: "POST", body: fd });
      if (!r.ok) throw new Error(String(r.status));
      return (await r.json()) as { avatarUrl: string };
    },
    onSuccess: refresh,
  });
}

export function useRemoveAvatar() {
  const refresh = useRefresh();
  return useMutation({ mutationFn: () => api("/api/admin/avatar", { method: "DELETE" }), onSuccess: refresh });
}

export function useCreateAdmin() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (v: { name: string; email: string; password: string; currentPassword: string }) =>
      api("/api/admin/admins", { method: "POST", body: body(v) }),
    onSuccess: refresh,
  });
}

export function useDeleteAdmin() {
  const refresh = useRefresh();
  return useMutation({
    mutationFn: (v: { id: string; currentPassword: string }) =>
      api(`/api/admin/admins/${v.id}`, { method: "DELETE", body: body({ currentPassword: v.currentPassword }) }),
    onSuccess: refresh,
  });
}