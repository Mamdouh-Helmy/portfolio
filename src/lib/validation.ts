import { z } from "zod";

// Messages are i18n keys (Validation.*) — shared by client and server.
export const loginSchema = z.object({
  email: z.email("email_invalid").max(120),
  password: z.string().min(8, "password_min").max(128),
});

export const contactSchema = z.object({
  name: z.string().trim().min(2, "name_min").max(80, "name_max"),
  email: z.email("email_invalid").max(120),
  message: z.string().trim().min(10, "message_min").max(2000, "message_max"),
});

const bi = (min: number, max: number) => {
  const text = z.string().trim().min(min, "required").max(max, "too_long");
  return z.object({ ar: text, en: text });
};

// z.url() لوحدها بتقبل javascript: و data:
const webUrl = z.url({ protocol: /^https?$/, error: "url_invalid" }).max(500, "too_long");

export const projectSchema = z.object({
  title: bi(2, 100),
  description: bi(10, 1000),
  tags: z.array(z.string().trim().min(1).max(30, "too_long")).max(8, "too_many_tags"),
  imageUrl: z.url({ protocol: /^https$/, hostname: /^res\.cloudinary\.com$/, error: "url_invalid" }).max(500),
  imagePublicId: z.string().min(1, "required").max(200),
  link: z.union([webUrl, z.literal("")], { error: "url_invalid" }).default(""),
  repo: z.union([webUrl, z.literal("")], { error: "url_invalid" }).default(""),
  category: z.string().trim().max(40, "too_long").default(""),
  year: z.string().trim().max(4, "too_long").default(""),
  metrics: z.array(z.object({ value: z.string().trim().min(1).max(12), ar: z.string().trim().min(1).max(40), en: z.string().trim().min(1).max(40) })).max(2).default([]),
  featured: z.boolean().default(false),
  order: z.number().int().min(0).max(9999, "too_long").default(0),
});

export type LoginInput = z.infer<typeof loginSchema>;
export type ContactInput = z.infer<typeof contactSchema>;
export type ProjectInput = z.infer<typeof projectSchema>;
export type FieldErrors = Record<string, string[] | undefined>;
export const fieldErrors = (e: z.ZodError): FieldErrors => z.flattenError(e).fieldErrors as FieldErrors;