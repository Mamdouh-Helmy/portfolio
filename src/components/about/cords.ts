import type { CordSpec } from "@/lib/elasticEngine";

/* ---------- الخيوط المطاطية (ثابتة برّه الـ component عشان متتعملش من جديد كل render) ---------- */
/*
 * العربي: الخيط بين الملاحظة ونهاية العنوان (العنوان قصير فحافته قريبة من آخر الكلام).
 * الإنجليزي: العنوان طويل ومتغير العرض، فمنربطش بحافته. الملاحظة قاعدة في نفس صف كلمة "About me"
 * على مسافة ثابتة منها (مش مكان مطلق)، فالخيط قوس قصير وثابت الشكل مهما اتغير عرض العنوان.
 */
export const HEADER_CORDS: Record<"ar" | "en", readonly CordSpec[]> = {
  ar: [{ from: "hello", to: "title", bow: 0.3 }],
  en: [{ from: "hello", to: "eyebrow", bow: 0.35 }],
};
export const COLLAGE_CORDS: readonly CordSpec[] = [{ from: "me", to: "photo", bow: -0.3 }];
export const STAT_CORDS: readonly CordSpec[] = [
  { from: "stat-0", to: "stat-1", bow: 0.12 },
  { from: "stat-1", to: "stat-2", bow: -0.12 },
];
