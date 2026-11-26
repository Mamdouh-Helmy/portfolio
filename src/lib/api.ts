import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { fieldErrors } from "./validation";

export const json = (data: unknown, status = 200) => NextResponse.json(data, { status });
export const unauthorized = () => json({ error: "unauthorized" }, 401);

export function handle<A extends unknown[]>(fn: (...a: A) => Promise<NextResponse>) {
  return async (...a: A) => {
    try { return await fn(...a); }
    catch (e) {
      if (e instanceof ZodError) return json({ error: "validation", fields: fieldErrors(e) }, 422);
      console.error(e);
      return json({ error: "server" }, 500);
    }
  };
}
