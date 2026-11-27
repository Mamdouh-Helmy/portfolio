import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { confirmPassword } from "@/lib/admin-password";
import { handle, json, unauthorized } from "@/lib/api";
import { COOKIE, cookieOptions, signToken } from "@/lib/auth";
import { requireAdmin } from "@/lib/require-admin";
import { updateProfileSchema } from "@/lib/validation";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

export const GET = handle(async (req: NextRequest) => {
  const id = await requireAdmin(req);
  if (!id) return unauthorized();
  const a = await Admin.findById(id).select("email name avatarUrl").lean();
  if (!a) return unauthorized();
  return json({ id, email: a.email, name: a.name || "", avatarUrl: a.avatarUrl || "" });
});

export const PATCH = handle(async (req: NextRequest) => {
  const id = await requireAdmin(req);
  if (!id) return unauthorized();

  const body = updateProfileSchema.parse(await req.json());
  const me = await Admin.findById(id).select("email");
  if (!me) return unauthorized();

  const email = body.email?.toLowerCase();
  const emailChanged = !!email && email !== me.email;

  // تغيير الإيميل أو الباسورد لازم يتأكد بالباسورد الحالي
  if (emailChanged || body.newPassword) {
    if (!body.currentPassword) return json({ error: "validation", fields: { currentPassword: ["required"] } }, 422);
    const r = await confirmPassword(id, body.currentPassword);
    if (r === "locked") return json({ error: "too_many" }, 429);
    if (r === "wrong") return json({ error: "wrong_password" }, 403);
  }

  const $set: Record<string, unknown> = {};
  if (body.name !== undefined) $set.name = body.name;
  if (emailChanged) $set.email = email;
  if (body.newPassword) $set.passwordHash = await bcrypt.hash(body.newPassword, 12);

  try {
    await Admin.updateOne(
      { _id: id },
      { $set, ...(body.newPassword ? { $inc: { tokenVersion: 1 } } : {}) },
    );
  } catch (e) {
    if ((e as { code?: number }).code === 11000) return json({ error: "email_taken" }, 409);
    throw e;
  }

  const fresh = await Admin.findById(id).select("email name avatarUrl tokenVersion").lean();
  if (!fresh) return unauthorized();

  const res = json({ id, email: fresh.email, name: fresh.name || "", avatarUrl: fresh.avatarUrl || "" });
  // تغيير الباسورد بيلغي كل الجلسات (tokenVersion++)، فبنطلّع كوكي جديدة للجلسة دي بس
  if (body.newPassword) res.cookies.set(COOKIE, await signToken(id, fresh.email, fresh.tokenVersion), cookieOptions);
  return res;
});