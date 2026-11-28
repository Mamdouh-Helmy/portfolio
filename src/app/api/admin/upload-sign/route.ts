import type { NextRequest } from "next/server";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/require-admin";
import { signUpload } from "@/lib/cloudinary";

export const POST = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  return json(signUpload());
});