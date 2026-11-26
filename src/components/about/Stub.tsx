"use client";
import { useLanguage } from "@/context/LanguageContext";
import { useCountUp } from "@/hooks/useCountUp";

export type StubProps = {
  v: number | string;
  l: string;
  s: string;
  plus?: boolean;
  i: number;
  tone: string;
  numCls: string;
  pose: string;
};

/* أماكن ربط الخيط: جوه الفتحتين اللي في الجنب، وفوق وتحت للموبايل */
const PINS = {
  left: "left-[7px] top-[69%]",
  right: "left-[calc(100%-7px)] top-[69%]",
  top: "left-1/2 top-0",
  bottom: "left-1/2 top-full",
};

export function Stub({ v, l, s, plus, i, tone, numCls, pose }: StubProps) {
  const { num } = useLanguage();
  const { ref, value } = useCountUp(Number(v));

  return (
    <div ref={ref} className={`stub relative h-[22rem] transition-transform duration-500 hover:rotate-0 lg:h-[26rem] ${tone} ${pose}`}>
      <span className="absolute start-5 top-5 font-mono text-[11px] tracking-[.25em] opacity-60">
        <bdi dir="ltr">Nº {String(i + 1).padStart(3, "0")}</bdi>
      </span>
      {/* end-5 عشان الباركود يبقى في الناحية التانية من الرقم */}
      <span aria-hidden className="barcode absolute end-5 top-4 w-16 lg:w-20" style={{ height: "1.4rem" }} />

      <dt className="absolute inset-x-4 bottom-4 top-[71%] flex flex-col justify-center text-center lg:inset-x-6">
        <span className="text-base font-bold lg:text-lg">{l}</span>
        <span className="mt-1 text-xs opacity-70">{s}</span>
      </dt>
      <dd className={`absolute inset-x-0 top-[38%] -translate-y-1/2 text-center font-display text-8xl leading-none tabular-nums lg:text-9xl ${numCls}`}>
        <span className="relative inline-block">
          {plus && <sup className="absolute -top-1 -start-6 text-3xl">+</sup>}
          {num(value)}
        </span>
      </dd>
      <span aria-hidden className="absolute inset-x-7 top-[69%] border-t-2 border-dashed border-current opacity-35" />
      {Object.entries(PINS).map(([side, position]) => (
        <span key={side} aria-hidden data-pin={side} className={`absolute ${position}`} />
      ))}
    </div>
  );
}