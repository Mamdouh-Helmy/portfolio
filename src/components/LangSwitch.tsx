"use client";
import { useLanguage } from "@/context/LanguageContext";

const styles = {
  light: { box: "border-ink/25", thumb: "bg-ink", on: "text-cream", off: "text-ink/65 hover:text-ink" },
  dark: { box: "border-cream/30", thumb: "bg-cream", on: "text-ink", off: "text-cream/65 hover:text-cream" },
};

export function LangSwitch({ variant = "dark" }: { variant?: "light" | "dark" }) {
  const { locale, setLocale } = useLanguage();
  const s = styles[variant];
  return (
    <div dir="ltr" role="group" aria-label="Language" className={`relative inline-flex w-28 rounded-full border p-1 font-mono text-xs ${s.box}`}>
      <span
        aria-hidden
        className={`absolute inset-y-1 left-1 w-[calc(50%-.25rem)] rounded-full shadow-md transition-transform duration-500 ease-[cubic-bezier(.65,0,.2,1)] ${s.thumb}`}
        style={{ transform: locale === "ar" ? "translateX(100%)" : "translateX(0)" }}
      />
      {(["en", "ar"] as const).map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => setLocale(l)}
          aria-pressed={locale === l}
          className={`relative z-10 flex-1 cursor-pointer rounded-full py-1.5 text-center font-bold transition-colors duration-300 ${locale === l ? s.on : s.off}`}
        >
          {l.toUpperCase()}
        </button>
      ))}
    </div>
  );
}