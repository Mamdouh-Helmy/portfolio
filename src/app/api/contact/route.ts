// src/app/api/contact/route.ts
import { after, type NextRequest } from "next/server";
import { handle, json } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { notifyNewMessage } from "@/lib/mail";
import { allow, clientIp } from "@/lib/rate-limit";
import { contactSchema } from "@/lib/validation";
import { Message } from "@/models/Message";

export const POST = handle(async (req: NextRequest) => {
  if (!allow(`contact:${clientIp(req)}`, 3, 10 * 60_000) || !allow("contact:all", 60, 60 * 60_000))
    return json({ error: "too_many" }, 429);
  const data = contactSchema.parse(await req.json());
  await connectDB();
  await Message.create(data);
  // بيتبعت بعد الرد على الزائر، ولو فشل الرسالة محفوظة برضه
  after(() => notifyNewMessage(data).catch((e) => console.error("mail:", e)));
  return json({ ok: true }, 201);
});