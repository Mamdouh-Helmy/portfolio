"use client";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";
import type { ProjectInput } from "@/lib/validation";
import type { ProjectDoc } from "@/models/Project";
import type { MessageDoc } from "@/models/Message";

export const keys = { projects: ["projects"] as const, messages: ["messages"] as const };

export const useProjects = () => useQuery({ queryKey: keys.projects, queryFn: () => api<ProjectDoc[]>("/api/projects") });

export function useProjectMutations() {
  const qc = useQueryClient();
  const done = { onSuccess: () => qc.invalidateQueries({ queryKey: keys.projects }) };
  return {
    create: useMutation({ mutationFn: (d: ProjectInput) => api("/api/admin/projects", { method: "POST", body: JSON.stringify(d) }), ...done }),
    update: useMutation({ mutationFn: ({ id, ...d }: ProjectInput & { id: string }) => api(`/api/admin/projects/${id}`, { method: "PUT", body: JSON.stringify(d) }), ...done }),
    remove: useMutation({ mutationFn: (id: string) => api(`/api/admin/projects/${id}`, { method: "DELETE" }), ...done }),
    upload: useMutation({ mutationFn: (file: File) => { const f = new FormData(); f.set("file", file); return api<{ url: string; publicId: string }>("/api/admin/upload", { method: "POST", body: f }); } }),
  };
}

export const useMessages = () => useQuery({ queryKey: keys.messages, queryFn: () => api<MessageDoc[]>("/api/admin/contact") });
export function useDeleteMessage() {
  const qc = useQueryClient();
  return useMutation({ mutationFn: (id: string) => api(`/api/admin/contact?id=${id}`, { method: "DELETE" }), onSuccess: () => qc.invalidateQueries({ queryKey: keys.messages }) });
}
