/* ---------- ثوابت التصميم ---------- */
export const chipShape = [
  "-rotate-2 rounded-full bg-sand border-ink/20",
  "rotate-1 rounded-xl bg-cream border-ink/30",
  "-rotate-1 rounded-full border-dashed border-ink/40",
  "rotate-2 rounded-lg bg-sand/60 border-ink/20",
];
export const blobs = [
  "rounded-[58%_42%_55%_45%/48%_56%_44%_52%]",
  "rounded-[44%_56%_48%_52%/55%_45%_55%_45%]",
  "rounded-[52%_48%_60%_40%/45%_55%_45%_55%]",
  "rounded-[48%_52%_42%_58%/56%_44%_52%_48%]",
];
export const stepOffset = ["", "lg:mt-14", "lg:mt-3", "lg:mt-16"];
/* lift = إزاحة حقيقية في الـ layout (مش transform) عشان نقطة ربط الخيط تفضل مظبوطة */
export const stubs = [
  { tone: "bg-sand text-ink", numCls: "text-terra", pose: "md:-rotate-2", lift: "" },
  { tone: "bg-ink text-cream weave", numCls: "text-sand", pose: "md:rotate-1", lift: "md:mt-8" },
  { tone: "bg-terra text-cream weave", numCls: "text-ink", pose: "md:-rotate-1", lift: "" },
];