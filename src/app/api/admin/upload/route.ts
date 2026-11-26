import type { NextRequest } from "next/server";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { uploadImage } from "@/lib/cloudinary";

const MAX = 5 * 1024 * 1024;

// نتأكد من محتوى الملف نفسه، لأن file.type جاي من العميل
const isImage = (b: Buffer) =>
  b.subarray(0, 3).equals(Buffer.from([0xff, 0xd8, 0xff])) || // JPEG
  b.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) || // PNG
  (b.toString("ascii", 0, 4) === "RIFF" && b.toString("ascii", 8, 12) === "WEBP");

export const POST = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  if (Number(req.headers.get("content-length")) > MAX + 100_000) return json({ error: "bad_file" }, 413);
  const file = (await req.formData()).get("file");
  if (!(file instanceof File) || file.size > MAX) return json({ error: "bad_file" }, 422);
  const buffer = Buffer.from(await file.arrayBuffer());
  if (!isImage(buffer)) return json({ error: "bad_file" }, 422);
  return json(await uploadImage(buffer), 201);
});