import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";

export const COOKIE = "admin_token";
const TTL = 60 * 60 * 2; // 2h
const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be at least 32 chars");
  return new TextEncoder().encode(s);
};

export const signToken = (email: string) =>
  new SignJWT({ role: "admin" }).setProtectedHeader({ alg: "HS256" }).setSubject(email)
    .setIssuedAt().setExpirationTime(`${TTL}s`).sign(secret());

export async function verifyToken(token?: string) {
  if (!token) return null;
  try { return (await jwtVerify(token, secret(), { algorithms: ["HS256"] })).payload; } catch { return null; }
}

export const cookieOptions = {
  httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL,
};

export async function getAdmin() {
  return verifyToken((await cookies()).get(COOKIE)?.value);
}

/** Defense in depth: route handlers re-check even though proxy.ts already gates /api/admin. */
export async function requireAdmin(req: NextRequest) {
  const admin = await verifyToken(req.cookies.get(COOKIE)?.value);
  if (!admin) return false;
  if (req.method !== "GET") { // CSRF: same-origin only for mutations
    const origin = req.headers.get("origin");
    if (!origin || new URL(origin).host !== req.headers.get("host")) return false;
  }
  return true;
}
