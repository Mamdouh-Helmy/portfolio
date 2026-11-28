import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { COOKIE, verifyToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";

export async function getAdmin() {
  const p = await verifyToken((await cookies()).get(COOKIE)?.value);
  if (!p?.sub) return null;
  await connectDB();
  const doc = await Admin.findById(p.sub).select("tokenVersion").lean();
  return doc && doc.tokenVersion === p.ver ? p : null;
}

export async function requireAdmin(req: NextRequest): Promise<string | null> {
  const p = await verifyToken(req.cookies.get(COOKIE)?.value);
  if (!p?.sub) return null;

  await connectDB();
  const doc = await Admin.findById(p.sub).select("tokenVersion").lean();
  if (!doc || doc.tokenVersion !== p.ver) return null;

  if (req.method !== "GET") {
    const origin = req.headers.get("origin");
    if (!origin || new URL(origin).host !== req.headers.get("host")) return null;
  }
  return String(p.sub);
}