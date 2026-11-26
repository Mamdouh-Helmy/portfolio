"use client";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { ToolRow } from "./ToolRow";

/* ---------- الأدوات: استيكرز ---------- */
export function Tools() {
  const t = useTranslations("About");
  const forward = [...site.tools, ...site.tools];
  const reversed = [...site.tools].reverse();
  const backward = [...reversed, ...reversed];

  return (
    <div className="mt-20 flex flex-col gap-6 md:mt-32 md:flex-row md:items-center md:gap-10">
      <div className="shrink-0">
        <h3 className="font-note text-2xl font-bold sm:text-3xl">{t("tools")}</h3>
        <p className="text-xs text-ink/65">{t("toolsSub")}</p>
      </div>
      <div className="min-w-0 flex-1 space-y-2">
        <ToolRow list={forward} />
        <ToolRow list={backward} reverse />
      </div>
    </div>
  );
}