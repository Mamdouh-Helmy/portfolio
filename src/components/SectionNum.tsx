import { useLocale } from "next-intl";
import type { ReactNode } from "react";

export function SectionNum({ n, className = "" }: { n: number; className?: string }) {
  const locale = useLocale();
  const s = new Intl.NumberFormat(locale === "ar" ? "ar-EG" : "en", { minimumIntegerDigits: 2, useGrouping: false }).format(n);
  return <span aria-hidden className={`pointer-events-none select-none font-display leading-none ${className}`}>{s}</span>;
}
export const hl = (c: ReactNode) => <em className="not-italic text-terra">{c}</em>;
