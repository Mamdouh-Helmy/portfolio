import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { confirmPassword } from "@/lib/admin-password";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/require-admin";
import { createAdminSchema } from "@/lib/validation";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

export const GET = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  const list = await Admin.find().select("email name avatarUrl lastLoginAt createdAt").sort({ createdAt: 1 }).lean();
  return json(
    list.map((a) => ({
      id: String(a._id), email: a.email, name: a.name || "", avatarUrl: a.avatarUrl || "",
      lastLoginAt: a.lastLoginAt ?? null, createdAt: a.createdAt,
    })),
  );
});

export const POST = handle(async (req: NextRequest) => {
  const id = await requireAdmin(req);
  if (!id) return unauthorized();

  const { name, email, password, currentPassword } = createAdminSchema.parse(await req.json());

  const r = await confirmPassword(id, currentPassword);
  if (r === "locked") return json({ error: "too_many" }, 429);
  if (r === "wrong") return json({ error: "wrong_password" }, 403);

  try {
    const created = await Admin.create({ name, email: email.toLowerCase(), passwordHash: await bcrypt.hash(password, 12) });
    return json({ id: String(created._id) }, 201);
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return json({ error: "email_taken" }, 409);
    throw e;
  }
});