import type { NextRequest } from "next/server";
import { isValidObjectId } from "mongoose";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Message } from "@/models/Message";

export const GET = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  await connectDB();
  return json(await Message.find().sort({ createdAt: -1 }).limit(200).lean());
});

export const DELETE = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  const id = req.nextUrl.searchParams.get("id");
  if (!id || !isValidObjectId(id)) return json({ error: "not_found" }, 404);
  await connectDB();
  if (!(await Message.findByIdAndDelete(id))) return json({ error: "not_found" }, 404);
  return json({ ok: true });
});