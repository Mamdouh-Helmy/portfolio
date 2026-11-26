import type { CSSProperties, ReactNode } from "react";

export const serif: CSSProperties = { fontFamily: "Georgia, 'Times New Roman', serif" };

/**
 * ورقة A4 بتتحجّم على ارتفاع الشاشة عشان المودال ميبقاش فيه سكرول.
 * 14rem = المساحة اللي بياخدها الهيدر والفوتر بتوع المودال.
 * الـ @container بيخلي وحدات cqw تتحسب على عرض الورقة نفسها.
 */
export function Paper({ children, label }: { children: ReactNode; label: string }) {
  return (
    <div className="@container mx-auto" style={{ width: "min(100%, calc((100dvh - 14rem) / 1.414))" }}>
      <div
        role="img"
        aria-label={label}
        dir="ltr"
        lang="en"
        className="relative aspect-[1/1.414] w-full overflow-hidden bg-[#fdfcf9] text-[#1b1f2a] shadow-xl shadow-ink/25 ring-1 ring-black/10"
        style={serif}
      >
        {children}
      </div>
    </div>
  );
}

/** ختم أو توقيع حقيقي مقصوص من الأصل (PNG شفاف). multiply بيخلي أي هالة بيضاء تختفي على الورقة. */
export function Ink({ src, className = "" }: { src: string; className?: string }) {
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt="" aria-hidden draggable={false} className={`pointer-events-none absolute select-none mix-blend-multiply ${className}`} />
  );
}