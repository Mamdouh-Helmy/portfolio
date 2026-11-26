"use client";
import { useCallback, useEffect, useState, type CSSProperties, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { useLenis } from "lenis/react";

type Props = {
  issuer: string;
  title: string;
  sub?: string;
  year: string | number;
  url?: string;
  verified?: boolean;
  /** صفحات الشهادة نفسها. لو موجودة المودال بيعرضها بدل الكارت النصي، من غير سكرول. */
  preview?: ReactNode[];
  labels: { close: string; open?: string; issuedBy: string; verified: string };
  onClose: () => void;
};

const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export function CertificateModal({ issuer, title, sub, year, verified, preview, labels, onClose }: Props) {
  const [closing, setClosing] = useState(false);
  const [page, setPage] = useState(0);
  const lenis = useLenis();
  const pages = preview ?? [];
  const multi = pages.length > 1;

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
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") setPage((p) => Math.min(p + 1, Math.max(0, pages.length - 1)));
      else if (e.key === "ArrowLeft") setPage((p) => Math.max(p - 1, 0));
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      root.style.overflow = "";
      document.body.style.paddingInlineEnd = "";
      lenis?.start();
    };
  }, [lenis, close, pages.length]);

  const pagerBtn = "grid size-9 place-items-center rounded-full border border-ink/40 font-mono text-sm transition-colors hover:border-terra hover:text-terra disabled:pointer-events-none disabled:opacity-30";

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label={title} className="fixed inset-0 z-[100] grid place-items-center p-3 sm:p-6">
      <button type="button" aria-label={labels.close} onClick={close} className={`absolute inset-0 cursor-default bg-ink/70 ${closing ? "modal-fade-out" : "modal-fade-in"}`} />

      <div
        data-lenis-prevent
        className={`relative w-full rounded-2xl border border-ink/30 bg-sand p-2.5 text-ink sm:p-3 ${preview ? "max-w-3xl" : "max-h-[92dvh] max-w-lg overflow-y-auto sm:max-h-[88dvh]"} ${closing ? "modal-pop-out" : "modal-pop-in"}`}
      >
        {preview ? (
          <div className="rounded-xl border-2 border-dashed border-ink/35 px-3 py-3 sm:px-5">
            <div className="flex items-center justify-between gap-4">
              <p className="rise min-w-0 truncate font-mono text-[11px] uppercase tracking-[.2em] text-ink/65 sm:text-xs" style={d(150)} dir="ltr">
                {labels.issuedBy} · {issuer}
              </p>
              <button type="button" onClick={close} className="shrink-0 font-mono text-xs text-ink/65 transition-colors hover:text-terra" dir="ltr">
                ✕ {labels.close}
              </button>
            </div>

            <h3 className="sr-only">{title}</h3>
            <div className="rise mt-3" style={d(230)}>{pages[page]}</div>

            <div className="rise mt-3 flex flex-wrap items-center justify-between gap-3 border-t border-dashed border-ink/30 pt-3" style={d(420)}>
              <div className="flex items-center gap-3">
                {verified && <span className="-rotate-3 border-2 border-terra bg-cream px-3 py-0.5 font-note text-base font-bold text-terra">{labels.verified}</span>}
              </div>

              {multi && (
                <div className="flex items-center gap-2" dir="ltr">
                  <button type="button" aria-label="Previous page" disabled={page === 0} onClick={() => setPage(page - 1)} className={pagerBtn}>←</button>
                  <span className="min-w-12 text-center font-mono text-sm" aria-live="polite">{page + 1} / {pages.length}</span>
                  <button type="button" aria-label="Next page" disabled={page === pages.length - 1} onClick={() => setPage(page + 1)} className={pagerBtn}>→</button>
                </div>
              )}

              <span className="font-display text-3xl leading-none text-terra sm:text-4xl" dir="ltr">{year}</span>
            </div>
          </div>
        ) : (
          <div className="relative rounded-xl border-2 border-dashed border-ink/35 px-5 pt-7 pb-6 sm:px-10 sm:pt-8 sm:pb-7">
            <div className="flex items-start justify-between gap-4">
              <p className="rise min-w-0 font-mono text-[11px] uppercase tracking-[.2em] text-ink/65 sm:text-xs" style={d(150)} dir="ltr">
                {labels.issuedBy} · {issuer}
              </p>
              <button type="button" onClick={close} className="shrink-0 font-mono text-xs text-ink/65 transition-colors hover:text-terra" dir="ltr">
                ✕ {labels.close}
              </button>
            </div>

            {verified && (
              <span className="stamp-in absolute end-4 top-14 border-2 border-terra bg-sand px-2.5 py-0.5 font-note text-base font-bold text-terra sm:end-8 sm:top-16 sm:px-3 sm:py-1 sm:text-lg">
                {labels.verified}
              </span>
            )}

            <h3 className="rise mt-16 max-w-[90%] font-display text-3xl leading-tight sm:mt-12 sm:max-w-[85%] sm:text-5xl" style={d(230)}>{title}</h3>
            {sub && <p className="rise mt-3 font-display text-base italic text-ink/65" style={d(300)} dir="ltr">{sub}</p>}
            <span className="squiggle rise mt-5 block w-28" style={d(360)} />

            <div className="rise mt-8 flex flex-wrap items-end justify-end gap-4 border-t border-dashed border-ink/30 pt-5 sm:mt-10" style={d(420)}>
              <span className="font-display text-4xl leading-none text-terra sm:text-5xl" dir="ltr">{year}</span>
            </div>
          </div>
        )}
      </div>
    </div>,
    document.body,
  );
}