"use client";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";
import { SectionNum } from "@/components/SectionNum";

type Props = {
  index: number;
  title: string;
  description: string;
  points?: string[];
  icon: ReactNode;
  labels: { close: string; includes: string; cta: string };
  onClose: () => void;
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function ServiceModal({ index, title, description, points, icon, labels, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const lenis = useLenis();

  const close = useCallback(() => {
    setClosing(true);
    setTimeout(onClose, 320);
  }, [onClose]);

  useEffect(() => {
    const root = document.documentElement;
    const sw = window.innerWidth - root.clientWidth;
    lenis?.stop();
    root.style.overflow = "hidden";
    document.body.style.paddingInlineEnd = `${sw}px`;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && close();
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = "";
      document.body.style.paddingInlineEnd = "";
      lenis?.start();
    };
  }, [lenis, close]);

  const goContact = () => {
    close();
    setTimeout(() => lenis?.scrollTo("#contact", { offset: -88, duration: 1.8 }), 400);
  };

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[100] grid place-items-center p-3 sm:p-6">
      <button
        type="button"
        aria-label={labels.close}
        onClick={close}
        className={`absolute inset-0 cursor-default bg-ink/80 ${closing ? "modal-fade-out" : "modal-fade-in"}`}
      />

      <div
        data-lenis-prevent
        className={`ticket relative max-h-[92dvh] w-full max-w-3xl overflow-y-auto rounded-3xl bg-cream text-ink sm:max-h-[88dvh] ${closing ? "sheet-out" : "sheet-in"}`}
      >
        <button
          type="button"
          onClick={close}
          dir="ltr"
          className="absolute end-3 top-3 z-10 rounded-full bg-ink px-4 py-1.5 font-mono text-xs text-cream transition-colors duration-300 hover:bg-terra sm:end-4 sm:top-4"
        >
          ✕ {labels.close}
        </button>

        <div className="grid md:grid-cols-[minmax(0,.85fr)_minmax(0,1.15fr)]">
          {/* الجزء الغامق */}
          <div className="weave relative flex min-h-[13rem] flex-col justify-between overflow-hidden bg-ink p-6 text-cream sm:min-h-[15rem] sm:p-8 md:min-h-[28rem]">
            <SectionNum n={index + 1} className="outline-cur rise -ms-1 text-[6rem] text-terra sm:text-[8rem] md:text-[10rem]" />

            <div className="relative">
              <span
                className="sticker rise mb-5 grid size-14 place-items-center rounded-full bg-terra text-cream sm:size-16"
                style={d(150)}
              >
                {icon}
              </span>
              <h3 className="rise font-display text-3xl leading-tight sm:text-4xl" style={d(220)}>{title}</h3>
              <span className="squiggle rise mt-4 block w-28" style={d(300)} />
            </div>
          </div>

          {/* الجزء الفاتح (خط متقطع = خط التمزيق) */}
          <div className="border-dashed border-ink/30 px-6 pt-8 pb-8 sm:px-8 sm:pb-9 md:border-s-2 md:pt-16">
            <p className="rise text-[15px] leading-[2.1] text-ink/70" style={d(280)}>{description}</p>

            {points && points.length > 0 && (
              <>
                <h4 className="rise mt-8 font-note text-xl font-bold text-terra" style={d(340)}>{labels.includes}</h4>
                <ul className="mt-3 space-y-1">
                  {points.map((p, i) => (
                    <li key={p} className="rise flex items-center gap-3.5 py-2" style={d(400 + i * 80)}>
                      <span className="check-box grid size-6 shrink-0 place-items-center">
                        <svg viewBox="0 0 24 24" className="size-5 text-terra" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
                          <path d="M3.5 12.5 9 18 21 5" className="check-path" style={{ animationDelay: `${520 + i * 80}ms` }} />
                        </svg>
                      </span>
                      <span className="text-sm font-semibold">{p}</span>
                    </li>
                  ))}
                </ul>
              </>
            )}

            <button
              type="button"
              onClick={goContact}
              className="rise group mt-9 inline-flex items-center gap-3 rounded-full bg-ink py-2 ps-6 pe-2 text-base font-semibold text-cream transition-colors duration-300 hover:bg-terra"
              style={d(460 + (points?.length ?? 0) * 80)}
            >
              {labels.cta}
              <span className="grid size-9 place-items-center rounded-full bg-cream text-ink transition-transform duration-300 group-hover:-rotate-45 rtl:rotate-180 rtl:group-hover:rotate-[225deg]">
                →
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}