import { SignJWT, jwtVerify } from "jose";

export const COOKIE = "admin_token";
const TTL = 60 * 60 * 2; // 2h
const secret = () => {
  const s = process.env.JWT_SECRET;
  if (!s || s.length < 32) throw new Error("JWT_SECRET must be at least 32 chars");
  return new TextEncoder().encode(s);
};

export const signToken = (id: string, email: string, ver: number) =>
  new SignJWT({ role: "admin", ver, email }).setProtectedHeader({ alg: "HS256" }).setSubject(id)
    .setIssuedAt().setExpirationTime(`${TTL}s`).sign(secret());

export async function verifyToken(token?: string) {
  if (!token) return null;
  try { return (await jwtVerify(token, secret(), { algorithms: ["HS256"] })).payload; } catch { return null; }
}

export const cookieOptions = {
  httpOnly: true, sameSite: "strict" as const, secure: process.env.NODE_ENV === "production", path: "/", maxAge: TTL,
};