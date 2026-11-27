import bcrypt from "bcryptjs";
import type { NextRequest } from "next/server";
import { handle, json } from "@/lib/api";
import { COOKIE, cookieOptions, signToken } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { allow, clientIp } from "@/lib/rate-limit";
import { loginSchema } from "@/lib/validation";
import { Admin } from "@/models/Admin";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;

// hash وهمي بيتولّد مرة واحدة، عشان زمن الرد يبقى ثابت حتى لو الإيميل مش موجود
let dummyHash: string | undefined;
const getDummy = () => (dummyHash ??= bcrypt.hashSync("dummy-password-for-timing", 12));

export const POST = handle(async (req: NextRequest) => {
  const { email, password } = loginSchema.parse(await req.json());

  // طبقة أولى best-effort في الذاكرة (على serverless كل instance له عدّاد لوحده)
  // الحماية الحقيقية هي الـ lockout في الـ DB تحت
  if (!allow(`login:${clientIp(req)}`, 10, 15 * 60_000) || !allow("login:all", 100, 15 * 60_000)) {
    return json({ error: "too_many" }, 429);
  }

  await connectDB();
  const admin = await Admin.findOne({ email: email.toLowerCase() }).select("+passwordHash");

  // بنعمل compare دايمًا حتى لو الإيميل غلط أو الحساب مقفول
  const ok = await bcrypt.compare(password, admin?.passwordHash ?? getDummy());

  if (admin?.lockUntil && admin.lockUntil > new Date()) {
    return json({ error: "too_many" }, 429);
  }

  if (!admin || !ok) {
    if (admin) {
      const upd = await Admin.findOneAndUpdate(
        { _id: admin._id },
        { $inc: { failedAttempts: 1 } },
        { new: true },
      );
      if (upd && upd.failedAttempts >= MAX_FAILS) {
        await Admin.updateOne(
          { _id: admin._id },
          { $set: { lockUntil: new Date(Date.now() + LOCK_MS), failedAttempts: 0 } },
        );
      }
    }
    return json({ error: "invalid" }, 401);
  }

  await Admin.updateOne(
    { _id: admin._id },
    { $set: { failedAttempts: 0, lockUntil: null, lastLoginAt: new Date() } },
  );

  const res = json({ ok: true });
  res.cookies.set(COOKIE, await signToken(String(admin._id), admin.email, admin.tokenVersion), cookieOptions);
  return res;
});