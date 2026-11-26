"use client";
import { useLanguage } from "@/context/LanguageContext";
import { blobs, stepOffset } from "./design";
import { useCopy } from "./helpers";

/* ---------- خطوات الشغل ---------- */
export function Process() {
  const { c } = useCopy();
  const { num } = useLanguage();
  const lastIndex = c.process.length - 1;

  return (
    <div className="mt-20 md:mt-32">
      <h3 className="font-note text-2xl font-bold text-terra sm:text-3xl">{c.processTitle}</h3>
      {/* 1 عمود موبايل، 2 تابلت، 4 على lg (مع الإزاحات والأسهم) */}
      <ol className="mt-10 grid gap-10 sm:grid-cols-2 sm:gap-12 lg:mt-12 lg:grid-cols-4 lg:gap-14">
        {c.process.map((p, i) => (
          <li key={p.t} className={`group relative ${stepOffset[i]}`}>
            <span className={`grid size-14 place-items-center bg-terra font-display text-2xl text-cream transition-transform duration-500 group-hover:rotate-12 group-hover:scale-110 ${blobs[i]}`}>
              {num(i + 1)}
            </span>
            <h4 className="mt-5 font-display text-2xl">{p.t}</h4>
            <p className="mt-2 text-sm leading-loose text-ink/65">{p.d}</p>
            {i < lastIndex && (
              <svg viewBox="0 0 48 40" className="absolute top-2 -end-[3.6rem] hidden w-12 text-ink/50 lg:block rtl:-scale-x-100" fill="none" aria-hidden>
                <path
                  d={i % 2 === 0 ? "M3 8C22 2 38 12 42 30M33 24L42 32L45 20" : "M3 32C22 38 38 28 42 10M33 16L42 8L45 20"}
                  stroke="currentColor"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeDasharray="1 5"
                />
              </svg>
            )}
          </li>
        ))}
      </ol>
    </div>
  );
}