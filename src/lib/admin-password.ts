import bcrypt from "bcryptjs";
import { Admin } from "@/models/Admin";

const MAX_FAILS = 5;
const LOCK_MS = 15 * 60_000;

export async function confirmPassword(id: string, password: string): Promise<"ok" | "wrong" | "locked"> {
  const a = await Admin.findById(id).select("+passwordHash lockUntil");
  if (!a) return "wrong";
  if (a.lockUntil && a.lockUntil > new Date()) return "locked";

  if (await bcrypt.compare(password, a.passwordHash)) {
    await Admin.updateOne({ _id: id }, { $set: { failedAttempts: 0 } });
    return "ok";
  }
  const u = await Admin.findOneAndUpdate({ _id: id }, { $inc: { failedAttempts: 1 } }, { new: true });
  if (u && u.failedAttempts >= MAX_FAILS) {
    await Admin.updateOne({ _id: id }, { $set: { lockUntil: new Date(Date.now() + LOCK_MS), failedAttempts: 0 } });
    return "locked";
  }
  return "wrong";
}