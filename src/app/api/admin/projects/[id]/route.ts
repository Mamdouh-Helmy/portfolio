import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { deleteImage } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
import { Project } from "@/models/Project";

type Ctx = { params: Promise<{ id: string }> };

export const PUT = handle(async (req: NextRequest, { params }: Ctx) => {
  if (!(await requireAdmin(req))) return unauthorized();
  const { id } = await params;
  if (!isValidObjectId(id)) return json({ error: "not_found" }, 404);
  const data = projectSchema.parse(await req.json());
  await connectDB();
  const old = await Project.findById(id);
  if (!old) return json({ error: "not_found" }, 404);
  const updated = await Project.findByIdAndUpdate(id, data, { new: true, runValidators: true });
  if (!updated) return json({ error: "not_found" }, 404);
  // الصورة القديمة تتمسح بعد ما التحديث ينجح
  if (old.imagePublicId !== data.imagePublicId) await deleteImage(old.imagePublicId).catch(console.error);
  return json(updated);
});

export const DELETE = handle(async (req: NextRequest, { params }: Ctx) => {
  if (!(await requireAdmin(req))) return unauthorized();
  const { id } = await params;
  if (!isValidObjectId(id)) return json({ error: "not_found" }, 404);
  await connectDB();
  const doc = await Project.findByIdAndDelete(id);
  if (!doc) return json({ error: "not_found" }, 404);
  await deleteImage(doc.imagePublicId).catch(console.error);
  return json({ ok: true });
});