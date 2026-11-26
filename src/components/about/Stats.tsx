"use client";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { stubs } from "./design";
import { Stub } from "./Stub";
import { StubChain } from "./StubChain";

/* ---------- الإحصائيات: تذاكر ---------- */
export function Stats() {
  const t = useTranslations("About");
  const stats = [
    { v: site.stats.years, l: t("years"), s: t("yearsSub") },
    { v: site.stats.projects, l: t("projects"), s: t("projectsSub"), plus: true },
    { v: site.stats.techs, l: t("techs"), s: t("techsSub") },
  ];

  return (
    <StubChain className="mt-20 md:mt-32">
      <dl className="mx-auto grid max-w-sm gap-14 md:max-w-none md:grid-cols-3 md:gap-7 lg:gap-12">
        {stats.map((s, i) => {
          const { lift, ...look } = stubs[i];
          return (
            <div key={s.l} data-stub className={`cursor-grab touch-pan-y select-none self-start active:cursor-grabbing ${lift}`}>
              <Stub i={i} {...s} {...look} />
            </div>
          );
        })}
      </dl>
    </StubChain>
  );
}