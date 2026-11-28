// src/lib/rate-limit.ts 
import type { NextRequest } from "next/server";

const hits = new Map<string, { n: number; reset: number }>();

export const clientIp = (req: NextRequest) => req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "local";

export function allow(key: string, max: number, windowMs: number) {
  const now = Date.now();
  if (hits.size > 5000) for (const [k, v] of hits) if (v.reset <= now) hits.delete(k);
  const prev = hits.get(key);
  const rec = prev && prev.reset > now ? prev : { n: 0, reset: now + windowMs };
  rec.n++;
  hits.set(key, rec);
  return rec.n <= max;
}

export const clearLimit = (key: string) => hits.delete(key);