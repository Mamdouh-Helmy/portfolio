"use client";
import { useTranslations } from "next-intl";
import { SectionNum, hl } from "@/components/SectionNum";
import { ElasticBoard, ElasticNode } from "@/components/Elastic";
import { HEADER_CORDS } from "./cords";
import { useCopy } from "./helpers";

/* ---------- Header ---------- */
export function AboutHeader() {
  const t = useTranslations("About");
  const { c, rtl } = useCopy();

  const eyebrow = (
    <ElasticNode id="eyebrow" draggable={false} anchor={[1.12, 0.5]} className="w-fit">
      <p className="text-sm text-terra">{t("eyebrow")}</p>
    </ElasticNode>
  );

  return (
    <ElasticBoard links={HEADER_CORDS[rtl ? "ar" : "en"]} rtl={rtl}>
      {/* الرقم أصغر على الموبايل، وفي الإنجليزي أصغر من العربي عشان ميلزقش في الكلام */}
      <SectionNum
        n={1}
        className={`outline-num pointer-events-none absolute -top-6 start-0 text-[7.5rem] leading-none opacity-70 sm:-top-8 sm:text-[11rem] ${rtl ? "md:text-[16rem]" : "md:text-[12rem]"}`}
      />

      <ElasticNode
        id="title"
        draggable={false}
        anchor={[1, 0.5]}
        className={`relative w-fit pt-20 sm:pt-24 md:pt-14 ${rtl ? "md:ps-52" : "md:ps-64"}`}
      >
        {rtl ? (
          eyebrow
        ) : (
          /* الإنجليزي: الـ eyebrow والملاحظة في نفس الصف، فالمسافة بينهم ثابتة والخيط قوس قصير مظبوط */
          <div className="flex items-end gap-6 md:gap-28">
            {eyebrow}
            <ElasticNode id="hello" anchor={[-0.06, 0.7]} className="mb-5 hidden md:block">
              <p className="-rotate-6 font-note text-xl font-bold text-terra">{c.noteHeader}</p>
            </ElasticNode>
          </div>
        )}
        <h2 className="font-display text-4xl leading-tight text-balance sm:text-5xl md:text-7xl">{t.rich("title", { hl })}</h2>
        <span className="squiggle mt-3 block w-44" />
      </ElasticNode>

      {/* العربي: نقطة بداية الخيط من تحت الطرف اليمين للملاحظة اللي في أقصى الشمال، برّه الكلام */}
      {rtl && (
        <ElasticNode id="hello" anchor={[0.3, 1]} className="absolute end-0 top-2 hidden md:block">
          <p className="-rotate-6 font-note text-xl font-bold text-terra">{c.noteHeader}</p>
        </ElasticNode>
      )}
    </ElasticBoard>
  );
}