"use client";
import { useEffect, useRef, useState, type PointerEvent as ReactPointerEvent } from "react";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { useLanguage } from "@/context/LanguageContext";
import { SectionNum } from "@/components/SectionNum";
import { CertificateModal } from "@/components/CertificateModal";
import { certificatePreviews } from "@/components/certificates";

/* مكان وأقل طول لكل كارد، بيتكرر لو الشهادات أكتر من 4 (الميل بيتحط على الكارد نفسه).
   الطول min-h مش ثابت، فالكارد بيكبر على قد المحتوى */
const place = [
  "lg:mt-0 lg:min-h-[290px]",
  "lg:mt-[62px] lg:min-h-[300px]",
  "lg:mt-[28px] lg:min-h-[300px]",
  "lg:mt-[75px] lg:min-h-[300px]",
];
const tilt = ["lg:rotate-[.6deg]", "lg:-rotate-[.8deg]", "lg:rotate-[.8deg]", "lg:-rotate-[.6deg]"];
/* الفتحات مرتبطة بالخيط، فبتظهر على lg وفوق بس */
const notch = "absolute top-1/2 hidden size-7 -translate-y-1/2 rounded-full bg-cream lg:block";

type Drag = { x: number; y: number; vx: number; vy: number; tx: number; ty: number; sx: number; sy: number; bx: number; by: number; on: boolean };
const fresh = (): Drag => ({ x: 0, y: 0, vx: 0, vy: 0, tx: 0, ty: 0, sx: 0, sy: 0, bx: 0, by: 0, on: false });
/** مقاومة مطاطية: كل ما تبعد أكتر السحب بيتقل */
const rubber = (d: number) => 170 * Math.tanh(d / 170);
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const f = (n: number) => n.toFixed(1);

export function Certificates() {
  const t = useTranslations("Certificates");
  const { locale } = useLanguage();
  const [open, setOpen] = useState<number | null>(null);
  const cur = open === null ? null : site.certificates[open];
  const count = site.certificates.length;

  const boxRef = useRef<HTMLDivElement>(null);
  const threadRef = useRef<SVGPathElement>(null);
  const knotsRef = useRef<SVGPathElement>(null);
  const S = useRef<Drag[]>([]);

  useEffect(() => {
    const box = boxRef.current;
    if (!box) return;
    const items = Array.from(box.querySelectorAll<HTMLElement>("[data-card]"));
    const lis = items.map((el) => el.parentElement as HTMLElement);
    const nl = items.map((el) => el.querySelector<HTMLElement>('[data-side="l"]')!);
    const nr = items.map((el) => el.querySelector<HTMLElement>('[data-side="r"]')!);
    S.current = items.map(fresh);

    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const lg = window.matchMedia("(min-width: 1024px)");
    let raf = 0;
    let last = 0;

    const center = (el: HTMLElement, c: DOMRect) => {
      const r = el.getBoundingClientRect();
      return { x: r.left + r.width / 2 - c.left, y: r.top + r.height / 2 - c.top };
    };
    const curve = (a: { x: number; y: number }, b: { x: number; y: number }, sag: number) =>
      `M${f(a.x)} ${f(a.y)}Q${f((a.x + b.x) / 2)} ${f((a.y + b.y) / 2 + sag * 2)} ${f(b.x)} ${f(b.y)}`;

    const draw = () => {
      const c = box.getBoundingClientRect();
      const order = items.map((_, i) => i).sort((a, b) => lis[a].offsetLeft - lis[b].offsetLeft);
      const pts = order.map((i) => ({ l: center(nl[i], c), r: center(nr[i], c) }));
      if (!pts.length) return;

      let d = curve({ x: -c.left - 10, y: pts[0].l.y - 28 }, pts[0].l, 14);
      let knots = "";
      pts.forEach((p, k) => {
        knots += `M${f(p.l.x)} ${f(p.l.y)}h.01M${f(p.r.x)} ${f(p.r.y)}h.01`;
        const nxt = pts[k + 1];
        if (nxt) {
          const dist = Math.hypot(nxt.l.x - p.r.x, nxt.l.y - p.r.y);
          d += curve(p.r, nxt.l, clamp(18 - (dist - 56) * 0.25, 3, 18));
        }
      });
      const end = pts[pts.length - 1].r;
      d += curve(end, { x: document.documentElement.clientWidth - c.left + 10, y: end.y - 28 }, 14);

      threadRef.current?.setAttribute("d", d);
      knotsRef.current?.setAttribute("d", knots);
    };

    const loop = (now: number) => {
      const dt = Math.min((now - last) / 1000, 1 / 30) || 1 / 60;
      last = now;
      const isLg = lg.matches;

      S.current.forEach((s, i) => {
        const el = items[i];
        if (!isLg) {
          s.x = s.y = s.vx = s.vy = 0;
          el.style.transform = "";
          lis[i].style.zIndex = "";
          return;
        }
        if (s.on) {
          const nx = s.x + (s.tx - s.x) * Math.min(1, dt * 20);
          const ny = s.y + (s.ty - s.y) * Math.min(1, dt * 20);
          s.vx = (nx - s.x) / dt;
          s.vy = (ny - s.y) / dt;
          s.x = nx;
          s.y = ny;
        } else if (reduce) {
          s.x = s.y = s.vx = s.vy = 0;
        } else {
          const k = 110; // صلابة الزنبرك
          const damp = 8; // التخميد (أقل = تأرجح أكتر)
          s.vx += (-k * s.x - damp * s.vx) * dt;
          s.vy += (-k * s.y - damp * s.vy) * dt;
          s.x += s.vx * dt;
          s.y += s.vy * dt;
          if (Math.abs(s.x) < 0.05 && Math.abs(s.y) < 0.05 && Math.abs(s.vx) < 0.5 && Math.abs(s.vy) < 0.5) {
            s.x = s.y = s.vx = s.vy = 0;
          }
        }
        const rot = clamp(s.vx * 0.012 + s.x * 0.04, -12, 12);
        el.style.transform = `translate3d(${s.x}px,${s.y}px,0) rotate(${rot}deg)`;
        lis[i].style.zIndex = s.on || s.x || s.y ? "30" : "";
      });

      if (isLg) draw();
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(
      ([e]) => {
        if (e.isIntersecting) {
          if (!raf) {
            last = performance.now();
            raf = requestAnimationFrame(loop);
          }
        } else {
          cancelAnimationFrame(raf);
          raf = 0;
        }
      },
      { rootMargin: "120px" },
    );
    io.observe(box);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [count]);

  const down = (e: ReactPointerEvent<HTMLDivElement>, i: number) => {
    const s = S.current[i];
    /* اللمس يفضل سكرول عادي، والسحب للماوس على lg وفوق بس */
    if (!s || e.button !== 0 || e.pointerType === "touch" || !window.matchMedia("(min-width: 1024px)").matches) return;
    if ((e.target as HTMLElement).closest("a,button")) return;
    s.on = true;
    s.sx = e.clientX;
    s.sy = e.clientY;
    s.bx = s.x;
    s.by = s.y;
    s.tx = s.x;
    s.ty = s.y;
    e.currentTarget.setPointerCapture(e.pointerId);
  };
  const move = (e: ReactPointerEvent<HTMLDivElement>, i: number) => {
    const s = S.current[i];
    if (!s?.on) return;
    s.tx = rubber(s.bx + e.clientX - s.sx);
    s.ty = rubber(s.by + e.clientY - s.sy);
  };
  const up = (i: number) => {
    const s = S.current[i];
    if (s) s.on = false;
  };

  return (
    <section id="certificates" className="dots relative overflow-x-clip px-6 py-20 md:py-0 md:pt-32 lg:pt-36">
      <div className="mx-auto max-w-6xl">
        <div className="flex items-start justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <p className="font-display text-lg italic text-terra sm:text-xl"><bdi>{t("eyebrow")}</bdi></p>
            <h2 className="font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{t("title")}</h2>
            <span className="squiggle mt-2 block w-44" />
          </div>
          <SectionNum n={4} className="outline-num shrink-0 text-6xl sm:text-8xl md:text-9xl" />
        </div>

        <div ref={boxRef} className="relative mt-16 md:mt-24">
          {/* الخيط: بيتحسب من مكان الفتحات كل frame */}
          <svg aria-hidden className="pointer-events-none absolute inset-0 z-40 hidden h-full w-full overflow-visible lg:block">
            <path ref={threadRef} fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" className="text-ink/70" />
            <path ref={knotsRef} fill="none" stroke="currentColor" strokeWidth={9} strokeLinecap="round" className="text-terra" />
          </svg>

          {/* flex + justify-center: أي عدد شهادات بيتوسّط ويتوزع لوحده */}
          <ul className="relative flex flex-wrap justify-center gap-x-6 gap-y-10 sm:gap-x-8 lg:min-h-[440px] lg:flex-nowrap lg:items-start lg:gap-8 xl:gap-14">
            {site.certificates.map((c, i) => (
              <li
                key={c.issuer + c.en}
                className={`group relative w-full sm:w-[calc(50%-1rem)] lg:flex lg:w-auto lg:min-w-0 lg:max-w-[260px] lg:flex-1 lg:basis-0 lg:hover:z-20 ${place[i % place.length]}`}
              >
                <div
                  data-card
                  onPointerDown={(e) => down(e, i)}
                  onPointerMove={(e) => move(e, i)}
                  onPointerUp={() => up(i)}
                  onPointerCancel={() => up(i)}
                  className="h-full w-full lg:cursor-grab lg:select-none lg:active:cursor-grabbing"
                >
                  <div
                    className={`relative flex h-full min-h-[15rem] flex-col justify-between rounded-2xl border border-ink/15 bg-sand p-6 transition-transform duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:-translate-y-3 sm:p-7 lg:min-h-0 lg:group-hover:-translate-y-5 lg:group-hover:rotate-0 ${tilt[i % tilt.length]}`}
                  >
                    <span data-side="l" className={`${notch} -left-3.5`} />
                    <span data-side="r" className={`${notch} -right-3.5`} />
                    {c.verified && (
                      <span className="absolute -top-5 start-4 -rotate-6 border-2 border-terra bg-cream px-3 py-1 font-note text-base font-bold text-terra transition-transform duration-500 group-hover:-rotate-12 group-hover:scale-110">
                        {t("verified")}
                      </span>
                    )}
                    <div>
                      <p className="font-mono text-xs uppercase tracking-[.14em] text-ink/65" dir="ltr">{c.issuer}</p>
                      <h3 className="mt-4 text-xl font-bold leading-snug sm:text-2xl">{c[locale]}</h3>
                      <p className="mt-2 font-display text-sm italic text-ink/65" dir="ltr">{c.sub}</p>
                    </div>
                    <div className="mt-6 flex items-end justify-between border-t border-dashed border-ink/30 pt-4">
                      <button
                        type="button"
                        onClick={() => setOpen(i)}
                        aria-haspopup="dialog"
                        className="border-b cursor-pointer border-ink font-mono text-sm transition-colors hover:border-terra hover:text-terra"
                        dir="ltr"
                      >
                        {t("verify")} ↗
                      </button>
                      <span className="font-display text-3xl text-terra transition-transform duration-500 group-hover:scale-125 sm:text-4xl" dir="ltr">{c.year}</span>
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {cur && (
        <CertificateModal
          key={open}
          issuer={cur.issuer}
          title={cur[locale]}
          sub={cur.sub}
          year={cur.year}
          url={cur.url}
          verified={cur.verified}
          preview={cur.preview ? certificatePreviews[cur.preview] : undefined}
          labels={{ close: t("close"), open: t("open"), issuedBy: t("issuedBy"), verified: t("verified") }}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}