// src/app/api/admin/contact/reply/route.ts
import { isValidObjectId } from "mongoose";
import type { NextRequest } from "next/server";
import { z } from "zod";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/require-admin";
import { connectDB } from "@/lib/db";
import { sendReply } from "@/lib/mail";
import { allow } from "@/lib/rate-limit";
import { Message } from "@/models/Message";

const schema = z.object({ id: z.string(), body: z.string().trim().min(2).max(5000) });

export const POST = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  const { id, body } = schema.parse(await req.json());
  if (!isValidObjectId(id)) return json({ error: "not_found" }, 404);
  if (!allow("reply:all", 20, 60 * 60_000)) return json({ error: "too_many" }, 429);
  await connectDB();
  // الإيميل بييجي من قاعدة البيانات مش من العميل
  const msg = await Message.findById(id);
  if (!msg) return json({ error: "not_found" }, 404);
  await sendReply({ name: msg.name, email: msg.email, message: msg.message }, body);
  msg.repliedAt = new Date();
  await msg.save();
  return json({ ok: true });
});