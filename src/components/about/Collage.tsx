"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { useLanguage } from "@/context/LanguageContext";
import { ElasticBoard, ElasticNode } from "@/components/Elastic";
import { COLLAGE_CORDS } from "./cords";
import { useCopy } from "./helpers";

/* ---------- Collage: بولارويد + ملاحظة مربوطين بخيط ---------- */
export function Collage() {
  const t = useTranslations("About");
  const { c, rtl } = useCopy();
  const { num } = useLanguage();

  return (
    <ElasticBoard links={COLLAGE_CORDS} rtl={rtl} className="mx-auto h-[32rem] w-full max-w-sm sm:h-[33rem] md:col-span-5">
      <ElasticNode id="photo" anchor={[0.5, 1]} className="absolute start-0 top-0">
        <figure className="relative w-48 -rotate-[5deg] transition-transform duration-500 hover:rotate-0 sm:w-60">
          <span aria-hidden className="absolute -top-3 start-1/2 z-10 h-6 w-20 -translate-x-1/2 rotate-3 bg-terra/60 rtl:translate-x-1/2 rtl:-rotate-3" />
          <div className="rounded-sm border border-ink/20 bg-cream p-3 pb-4">
            <div className="halftone relative aspect-[4/5] overflow-hidden bg-sand text-ink">
              <Image src="/images/about-portrait.webp" alt="" fill sizes="(min-width: 640px) 240px, 192px" className="object-cover object-top" />
            </div>
            <figcaption className="mt-4 text-center font-note text-lg font-bold sm:text-xl">{c.role}</figcaption>
          </div>
          <span className="absolute -end-4 -top-6 grid size-20 rotate-12 place-items-center rounded-full bg-terra text-center text-cream outline-2 -outline-offset-4 outline-dashed outline-cream/70 sm:-end-7 sm:-top-7 sm:size-24">
            <span className="max-w-[4.5rem] leading-tight">
              <span className="block font-display text-xl sm:text-2xl">{num(Number(site.stats.years))}+</span>
              <span className="block text-[9px] font-bold leading-[1.15] sm:text-[10px]">{t("years")}</span>
            </span>
          </span>
        </figure>
      </ElasticNode>

      <ElasticNode id="code" className="absolute bottom-6 end-0">
        <figure className="relative w-36 rotate-[6deg] transition-transform duration-500 hover:rotate-0 sm:w-44">
          <span aria-hidden className="absolute -top-3 start-1/3 z-10 h-5 w-14 -rotate-6 bg-ink/40" />
          <div className="rounded-sm border border-ink/20 bg-cream p-2.5 pb-3">
            <div className="weave grid aspect-square place-items-center bg-ink font-mono text-3xl font-bold text-terra sm:text-4xl" dir="ltr">
              {"</>"}
            </div>
            <figcaption className="mt-3 text-center font-note text-base font-bold sm:text-lg">TypeScript</figcaption>
          </div>
        </figure>
      </ElasticNode>

      <ElasticNode id="me" anchor={[0.5, 0]} className="absolute bottom-0 start-4">
        <p className="-rotate-3 font-note text-lg font-bold text-terra">{c.noteMe}</p>
      </ElasticNode>
    </ElasticBoard>
  );
}