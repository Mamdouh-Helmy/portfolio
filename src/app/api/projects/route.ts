import { handle, json } from "@/lib/api";
import { connectDB } from "@/lib/db";
import { Project } from "@/models/Project";

export const GET = handle(async () => {
  await connectDB();
  return json(await Project.find().sort({ featured: -1, order: 1, createdAt: -1 }).lean());
});
