"use client";
import { useCopy } from "./helpers";

/* ---------- دعوة للتواصل: تذكرة بكعب ---------- */
export function ContactCta() {
  const { c } = useCopy();

  return (
    <a
      href="#contact"
      className="ticket-cta group relative mt-20 flex flex-col overflow-hidden rounded-[2rem] transition-transform duration-500 hover:-rotate-1 md:mt-32 md:flex-row md:rounded-none"
    >
      <span className="weave flex-1 bg-ink p-7 font-display text-3xl leading-snug text-cream sm:p-10 md:p-14 md:text-5xl">{c.ctaTitle}</span>
      <span className="flex shrink-0 flex-col items-start justify-between gap-5 border-dashed border-cream/50 bg-terra p-7 text-cream sm:gap-6 sm:p-10 md:w-[28%] md:border-s-2 md:p-8">
        <span dir="ltr" className="font-mono text-[11px] tracking-[.25em] opacity-70">ADMIT ONE</span>
        <span className="font-display text-2xl sm:text-3xl">{c.ctaBtn}</span>
        <span className="text-4xl transition-transform duration-500 group-hover:translate-x-2 sm:text-5xl rtl:rotate-180 rtl:group-hover:-translate-x-2">→</span>
      </span>
    </a>
  );
}