"use client";
import { useState } from "react";
import type { ZodType } from "zod";
import { ApiError } from "@/lib/fetcher";
import { fieldErrors, type FieldErrors } from "@/lib/validation";

export function useZodForm<T extends Record<string, string>>(schema: ZodType, initial: T) {
  const [values, setValues] = useState(initial);
  const [errors, setErrors] = useState<FieldErrors>({});
  const set = (k: keyof T) => (e: { target: { value: string } }) => setValues((v) => ({ ...v, [k]: e.target.value }));

  const validate = () => {
    const r = schema.safeParse(values);
    setErrors(r.success ? {} : fieldErrors(r.error));
    return r.success;
  };
  const applyServerError = (e: unknown) => { if (e instanceof ApiError && e.fields) setErrors(e.fields); };
  const reset = () => { setValues(initial); setErrors({}); };
  return { values, errors, set, validate, applyServerError, reset };
}
