"use client";
import { useCopy } from "./helpers";

/* ---------- قواعدي: صفحة كراسة ---------- */
export function Principles() {
  const { c } = useCopy();

  return (
    <div className="paper relative mx-auto mt-20 max-w-4xl rounded-sm border border-ink/20 py-8 ps-14 pe-4 sm:py-10 sm:ps-20 sm:pe-6 md:mt-32 md:-rotate-1 md:ps-28 md:pe-12">
      <span aria-hidden className="absolute -top-3 start-1/2 h-6 w-24 -translate-x-1/2 rotate-2 bg-terra/60" />
      <span aria-hidden className="absolute inset-y-0 start-10 w-px bg-terra/50 sm:start-14 md:start-20" />
      {["top-[14%]", "top-1/2", "top-[86%]"].map((p) => (
        <span key={p} aria-hidden className={`absolute start-2 size-4 -translate-y-1/2 rounded-full border border-ink/30 bg-cream sm:start-4 md:start-7 ${p}`} />
      ))}

      <h3 className="font-note text-2xl font-bold leading-10 text-terra sm:text-3xl">{c.principlesTitle}</h3>
      <ol>
        {c.principles.map((p, i) => (
          <li key={p.t} className="flex items-start gap-3 sm:gap-4">
            <svg viewBox="0 0 24 24" className="mt-2 size-6 shrink-0 text-terra" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
              <path pathLength={1} className="scribble" style={{ animationDelay: `${0.4 + i * 0.25}s` }} d="M3.5 12.5 9 18 21 5" />
            </svg>
            <div className="min-w-0">
              <h4 className="font-display text-xl leading-10 sm:text-2xl">
                <span className="marker">{p.t}</span>
              </h4>
              <p className="text-[14px] leading-10 text-ink/70 sm:text-[15px]">{p.d}</p>
            </div>
          </li>
        ))}
      </ol>
    </div>
  );
}