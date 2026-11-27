import { isValidObjectId } from "mongoose";
import type { NextRequest } from "next/server";
import { confirmPassword } from "@/lib/admin-password";
import { handle, json, unauthorized } from "@/lib/api";
import { deleteImage } from "@/lib/cloudinary";
import { requireAdmin } from "@/lib/require-admin";
import { confirmSchema } from "@/lib/validation";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

export const DELETE = handle(async (req: NextRequest, ctx: { params: Promise<{ id: string }> }) => {
  const me = await requireAdmin(req);
  if (!me) return unauthorized();

  const { id } = await ctx.params;
  if (!isValidObjectId(id)) return json({ error: "not_found" }, 404);
  if (id === me) return json({ error: "cannot_delete_self" }, 400); // دايمًا هيفضل أدمن واحد على الأقل

  const { currentPassword } = confirmSchema.parse(await req.json());
  const r = await confirmPassword(me, currentPassword);
  if (r === "locked") return json({ error: "too_many" }, 429);
  if (r === "wrong") return json({ error: "wrong_password" }, 403);

  const target = await Admin.findByIdAndDelete(id).select("avatarPublicId");
  if (!target) return json({ error: "not_found" }, 404);
  if (target.avatarPublicId) await deleteImage(target.avatarPublicId).catch(console.error);
  return json({ ok: true });
});