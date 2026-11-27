"use client";
import Image from "next/image";
import { useState, type ComponentProps, type ReactNode } from "react";
import { ApiError } from "@/lib/fetcher";

export const btn = "rounded-full px-5 py-2.5 text-sm font-semibold transition hover:-translate-y-0.5 disabled:translate-y-0 disabled:opacity-60";
export const card = "rounded-3xl border border-ink/10 bg-cream p-5 shadow-lg shadow-ink/5";

export function Avatar({ url, name = "", size = 44, ring = false }: { url?: string; name?: string; size?: number; ring?: boolean }) {
  return (
    <span
      className={`relative grid shrink-0 place-items-center overflow-hidden rounded-full ${url ? "bg-sand" : "sun text-cream"} ${ring ? "ring-4 ring-cream/30" : ""}`}
      style={{ width: size, height: size }}
    >
      {url ? (
        <Image src={url} alt="" fill sizes={`${size}px`} className="object-cover" />
      ) : (
        <span aria-hidden className="font-display" style={{ fontSize: size * 0.45 }}>{Array.from(name.trim())[0]?.toUpperCase() ?? "?"}</span>
      )}
    </span>
  );
}

export function Section({ n, title, children }: { n: string; title: string; children: ReactNode }) {
  return (
    <fieldset className={card}>
      <legend className="sr-only">{title}</legend>
      <h2 aria-hidden className="font-display mb-4 flex items-center gap-3 text-2xl"><span className="outline-num text-4xl">{n}</span>{title}</h2>
      {children}
    </fieldset>
  );
}

export function Labeled({ label, error, hint, children }: { label: string; error?: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1 flex justify-between gap-2 text-sm font-semibold">{label}{hint && <span className="text-xs font-normal text-ink/50">{hint}</span>}</span>
      {children}
      {error && <span className="mt-1 block text-sm text-terra">{error}</span>}
    </label>
  );
}

export function PasswordInput({ showLabel, hideLabel, className = "", ...props }: ComponentProps<"input"> & { showLabel: string; hideLabel: string }) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative" dir="ltr">
      <input {...props} type={show ? "text" : "password"} className={`input pr-16 ${className}`} />
      <button type="button" onClick={() => setShow((s) => !s)} className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-sand px-3 py-1 text-xs font-semibold">
        {show ? hideLabel : showLabel}
      </button>
    </div>
  );
}

export const strength = (p: string) =>
  [p.length >= 12, p.length >= 16, /[A-Z]/.test(p) && /[a-z]/.test(p), /\d/.test(p) && /[^A-Za-z0-9]/.test(p)].filter(Boolean).length;

export function Meter({ value }: { value: string }) {
  const s = value ? strength(value) : 0;
  return (
    <div aria-hidden className="mt-2 flex gap-1">
      {[1, 2, 3, 4].map((i) => (
        <span key={i} className={`h-1.5 flex-1 rounded-full transition-colors ${i <= s ? (s < 3 ? "bg-sun" : "bg-terra") : "bg-ink/10"}`} />
      ))}
    </div>
  );
}

export type Msg = { ok: boolean; text: string } | null;

export function Notice({ msg }: { msg: Msg }) {
  if (!msg) return null;
  return (
    <p role={msg.ok ? "status" : "alert"} className={`swap rounded-xl border-2 border-dashed px-4 py-2 text-sm ${msg.ok ? "border-ink/30 bg-sand/60 text-ink" : "border-terra bg-terra/10 text-terra"}`}>
      {msg.ok ? "✓ " : ""}{msg.text}
    </p>
  );
}

export function explain(e: unknown, m: { wrong: string; locked: string; taken: string; failed: string }) {
  if (e instanceof ApiError) {
    if (e.status === 403) return m.wrong;
    if (e.status === 429) return m.locked;
    if (e.status === 409) return m.taken;
  }
  return m.failed;
}

export function fieldError(e: unknown, k: string): string | undefined {
  return e instanceof ApiError ? e.fields?.[k]?.[0] : undefined;
}