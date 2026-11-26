"use client";
import { useTranslations } from "next-intl";
import { splitDropCap, useCopy } from "./helpers";

/* ---------- القصة ---------- */
export function Story() {
  const t = useTranslations("About");
  const { c, rtl } = useCopy();
  const { cap, text } = splitDropCap(!rtl, t("dropcap"), t("p1"));

  return (
    <div className="md:col-span-7">
      <blockquote className="relative font-display text-3xl leading-[1.4] sm:text-4xl md:text-4xl lg:text-5xl lg:leading-[1.35]">
        <span aria-hidden className="outline-num absolute -start-2 -top-8 select-none text-[5rem] leading-none opacity-60 sm:-top-10 sm:text-[7rem]">“</span>
        <span className="marker relative">{c.quote}</span>
      </blockquote>

      {/* عمودين على الشاشات الصغيرة-المتوسطة (العرض كامل) وعلى xl، وعمود واحد على md/lg لأن عمود القصة بيبقى ضيق */}
      <div className="mt-8 grid gap-8 text-[15px] leading-[2.1] text-ink/65 sm:grid-cols-2 md:mt-10 md:grid-cols-1 xl:grid-cols-2">
        <p>
          <span className="float-start me-4 mt-1 grid size-14 -rotate-6 place-items-center rounded-2xl bg-ink font-display text-3xl leading-none text-terra sm:size-16 sm:text-4xl">
            {cap}
          </span>
          {text}
        </p>
        <div>
          <p>{t("p2")}</p>
          <p className="mt-5 inline-block -rotate-2 font-display text-3xl text-ink">{t("sign")}</p>
          <span className="squiggle mt-1 block w-24" />
        </div>
      </div>

      <div className="relative mt-10 w-fit max-w-full rotate-2 bg-sand px-5 py-4 font-note text-lg font-bold sm:px-7 sm:py-5 sm:text-xl">
        <span aria-hidden className="absolute -top-2 start-1/2 h-4 w-14 -translate-x-1/2 -rotate-2 bg-terra/55" />
        {c.available}
      </div>
    </div>
  );
}