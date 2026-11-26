import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { handle, json } from "@/lib/api";
import { COOKIE, cookieOptions, signToken } from "@/lib/auth";
import { allow, clearLimit, clientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";

const DUMMY = "$2b$12$C6UzMDM.H6dfI/f/IKcEeO5X1cYb1wZ0uXQ5Y0b7fQ9w8G7q1mJ2K";

export const POST = handle(async (req: NextRequest) => {
  const { email, password } = loginSchema.parse(await req.json());

  const key = `login:${clientIp(req)}`;
  // حد لكل IP، وحد عام لو الهجوم من IPs كتير أو بـ header مزوّر
  if (!allow(key, 5, 15 * 60_000) || !allow("login:all", 50, 15 * 60_000)) return json({ error: "too_many" }, 429);

  const okEmail = email.toLowerCase() === process.env.ADMIN_EMAIL?.toLowerCase();
  const okPass = await bcrypt.compare(password, process.env.ADMIN_PASSWORD_HASH || DUMMY);
  if (!okEmail || !okPass) return json({ error: "invalid" }, 401);

  clearLimit(key);
  const res = json({ ok: true });
  res.cookies.set(COOKIE, await signToken(email), cookieOptions);
  return res;
});