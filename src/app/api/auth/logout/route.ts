import { json } from "@/lib/api";
import { COOKIE } from "@/lib/auth";

export async function POST() {
  const res = json({ ok: true });
  res.cookies.set(COOKIE, "", { path: "/", maxAge: 0 });
  return res;
}
