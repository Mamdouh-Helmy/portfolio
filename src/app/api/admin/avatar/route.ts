import type { NextRequest } from "next/server";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/require-admin";
import { deleteImage, uploadImage } from "@/lib/cloudinary";
import { connectDB } from "@/lib/db";
import { Admin } from "@/models/Admin";

export const runtime = "nodejs";

const MAX = 4 * 1024 * 1024;

function isImage(b: Buffer) {
  const jpeg = b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff;
  const png = b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]));
  const webp = b.subarray(0, 4).toString("ascii") === "RIFF" && b.subarray(8, 12).toString("ascii") === "WEBP";
  return jpeg || png || webp;
}

export const POST = handle(async (req: NextRequest) => {
  const id = await requireAdmin(req);
  if (!id) return unauthorized();

  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || file.size === 0) return json({ error: "validation" }, 422);
  if (file.size > MAX) return json({ error: "too_large" }, 413);

  const buf = Buffer.from(await file.arrayBuffer());
  if (!isImage(buf)) return json({ error: "bad_type" }, 415);

  const admin = await Admin.findById(id).select("avatarPublicId");
  if (!admin) return unauthorized();

  const { url, publicId } = await uploadImage(buf, {
    folder: "portfolio/admin",
    transformation: [{ width: 400, height: 400, crop: "fill", gravity: "face", quality: "auto", fetch_format: "auto" }],
  });

  const old = admin.avatarPublicId;
  await Admin.updateOne({ _id: id }, { $set: { avatarUrl: url, avatarPublicId: publicId } });
  if (old) await deleteImage(old).catch(console.error); // مسح القديمة بعد نجاح الحفظ

  return json({ avatarUrl: url });
});

export const DELETE = handle(async (req: NextRequest) => {
  const id = await requireAdmin(req);
  if (!id) return unauthorized();

  const admin = await Admin.findById(id).select("avatarPublicId");
  if (!admin) return unauthorized();
  if (admin.avatarPublicId) await deleteImage(admin.avatarPublicId).catch(console.error);
  await Admin.updateOne({ _id: id }, { $set: { avatarUrl: "", avatarPublicId: "" } });
  return json({ ok: true });
});