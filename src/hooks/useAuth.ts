"use client";
import { useMutation } from "@tanstack/react-query";
import { api } from "@/lib/fetcher";
import type { ContactInput, LoginInput } from "@/lib/validation";

export const useLogin = () => useMutation({ mutationFn: (d: LoginInput) => api("/api/auth/login", { method: "POST", body: JSON.stringify(d) }) });
export const useLogout = () => useMutation({ mutationFn: () => api("/api/auth/logout", { method: "POST" }) });
export const useSendContact = () => useMutation({ mutationFn: (d: ContactInput) => api("/api/contact", { method: "POST", body: JSON.stringify(d) }) });
