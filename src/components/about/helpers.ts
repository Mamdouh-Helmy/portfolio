import { useLocale } from "next-intl";
import { copy } from "./copy";

/* ---------- Helpers ---------- */
export function useCopy() {
  const locale = useLocale();
  const rtl = locale === "ar";
  return { c: copy[rtl ? "ar" : "en"], rtl };
}

/**
 * الحرف الكبير في الإنجليزي لازم يبقى حرف واحد بس ("I")، والباقي يكمّل في الفقرة.
 * في العربي الكلمة كلها ("بدأتُ") بتتحط جوه المربع زي ما هي.
 */
export function splitDropCap(isLatin: boolean, cap: string, body: string) {
  if (!isLatin) return { cap, text: body };
  const [first = "", ...rest] = Array.from(cap.trim());
  return { cap: first, text: [rest.join("").trim(), body].filter(Boolean).join(" ") };
}
