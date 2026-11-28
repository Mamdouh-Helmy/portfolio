//api/admin/projects/route.ts
import type { NextRequest } from "next/server";
import { handle, json, unauthorized } from "@/lib/api";
import { requireAdmin } from "@/lib/require-admin";
import { connectDB } from "@/lib/db";
import { projectSchema } from "@/lib/validation";
import { Project } from "@/models/Project";

export const POST = handle(async (req: NextRequest) => {
  if (!(await requireAdmin(req))) return unauthorized();
  const data = projectSchema.parse(await req.json());
  await connectDB();
  return json(await Project.create(data), 201);
});
