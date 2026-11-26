"use client";
import { useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from "react";
import { GlobeHemisphereWest, PenNib, Stack, Gauge, PlugsConnected } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { SectionNum, hl } from "@/components/SectionNum";
import { ServiceModal } from "@/components/ServiceModal";

const icons = [GlobeHemisphereWest, PenNib, Stack, Gauge, PlugsConnected];
const tones = ["bg-ink text-cream weave", "bg-terra text-cream weave", "bg-sand text-ink ring-1 ring-ink/15", "bg-ink text-cream weave", "bg-terra text-cream weave"];
/* الوضعية المروحية على lg وفوق بس؛ تحت كده الكروت Grid عادي */
const pose = [
  "lg:rotate-[11deg] lg:translate-y-14", "lg:rotate-[5deg] lg:translate-y-5", "lg:z-10 lg:-translate-y-4",
  "lg:-rotate-[5deg] lg:translate-y-5", "lg:-rotate-[11deg] lg:translate-y-14",
];

type Item = { t: string; d: string; p?: string[] };

/* ---------- إعدادات الفيزياء (غيّرها براحتك) ---------- */
const THRESHOLD = 6;      // px قبل ما نعتبرها سحب مش ضغطة
const STIFF = 0.1;        // قوة الرجوع (أعلى = أسرع)
const DAMP = 0.82;        // الاحتكاك (أقل = ارتداد أكتر)
const PULL = 0.2;         // قد إيه الكروت المجاورة بتتشد مع الكارت اللي بتسحبه
const SLACK = 1.12;       // ارتخاء الخيط وهو ساكن
const LEVERS = [-0.26, 0.26]; // مكان تثبيت خيطين في كل كارت (نسبة من الارتفاع)

type S = { x: number; y: number; vx: number; vy: number; sc: number; rot: number; drag: boolean; px: number; py: number; bx: number; by: number };
const mk = (): S => ({ x: 0, y: 0, vx: 0, vy: 0, sc: 1, rot: 0, drag: false, px: 0, py: 0, bx: 0, by: 0 });
const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));
const isDesktop = () => window.matchMedia("(min-width: 1024px)").matches;

type Api = { grab: (i: number) => void; pull: (i: number, dx: number, dy: number) => void; release: (i: number) => void };

/* كارت يتسحب بالماوس، والحركة نفسها بيحسبها الأب (Services) */
function DragCard({
  index,
  poseClass,
  toneClass,
  api,
  setLi,
  setBtn,
  onOpen,
  children,
}: {
  index: number;
  poseClass: string;
  toneClass: string;
  api: Api;
  setLi: (el: HTMLLIElement | null) => void;
  setBtn: (el: HTMLButtonElement | null) => void;
  onOpen: () => void;
  children: ReactNode;
}) {
  const st = useRef({ id: -1, x0: 0, y0: 0, moved: false });
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const [lift, setLift] = useState(false);

  useEffect(() => () => clearTimeout(timer.current), []);

  const down = (e: PointerEvent<HTMLButtonElement>) => {
    if (e.pointerType === "touch" || e.button !== 0 || !isDesktop()) return; // اللمس والشاشات الصغيرة: ضغطة عادية
    clearTimeout(timer.current);
    e.currentTarget.setPointerCapture(e.pointerId);
    st.current = { id: e.pointerId, x0: e.clientX, y0: e.clientY, moved: false };
    api.grab(index);
    setLift(true);
  };

  const move = (e: PointerEvent<HTMLButtonElement>) => {
    const s = st.current;
    if (e.pointerId !== s.id) return;
    const dx = e.clientX - s.x0;
    const dy = e.clientY - s.y0;
    if (!s.moved && Math.hypot(dx, dy) > THRESHOLD) s.moved = true;
    if (s.moved) api.pull(index, dx, dy);
  };

  const end = (e: PointerEvent<HTMLButtonElement>) => {
    const s = st.current;
    if (e.pointerId !== s.id) return;
    s.id = -1;
    if (e.currentTarget.hasPointerCapture(e.pointerId)) e.currentTarget.releasePointerCapture(e.pointerId);
    api.release(index);
    timer.current = setTimeout(() => setLift(false), 1100);
  };

  const click = () => {
    if (st.current.moved) {
      st.current.moved = false;
      return; // كان سحب مش ضغطة، متفتحش المودال
    }
    onOpen();
  };

  return (
    <li
      ref={setLi}
      className={`relative z-[1] flex lg:w-[12.5rem] lg:origin-bottom lg:-ms-5 lg:first:ms-0 xl:w-[15rem] 2xl:w-[17rem] ${poseClass}`}
      style={lift ? { zIndex: 40 } : undefined}
    >
      <button
        ref={setBtn}
        type="button"
        onClick={click}
        onPointerDown={down}
        onPointerMove={move}
        onPointerUp={end}
        onPointerCancel={end}
        draggable={false}
        aria-haspopup="dialog"
        className={`relative flex min-h-[19rem] w-full select-none flex-col justify-end rounded-[1.75rem] p-6 text-start will-change-transform lg:min-h-[22rem] lg:cursor-grab lg:p-5 lg:active:cursor-grabbing xl:p-7 ${toneClass}`}
      >
        {children}
      </button>
    </li>
  );
}

export function Services() {
  const t = useTranslations("Services");
  const items = t.raw("items") as Item[];
  const [open, setOpen] = useState<number | null>(null);
  const OpenIcon = open === null ? null : icons[open];
  const cur = open === null ? null : items[open];

  const n = items.length;
  const wrap = useRef<HTMLDivElement>(null);
  const lis = useRef<(HTMLLIElement | null)[]>([]);
  const btns = useRef<(HTMLButtonElement | null)[]>([]);
  const paths = useRef<(SVGPathElement | null)[]>([]);
  const st = useRef<S[]>(Array.from({ length: n }, mk));
  const kickRef = useRef<() => void>(() => {});

  const api = useMemo<Api>(
    () => ({
      grab: (i) => {
        const s = st.current[i];
        s.drag = true; s.bx = s.x; s.by = s.y; s.px = s.x; s.py = s.y;
        kickRef.current();
      },
      pull: (i, dx, dy) => {
        const s = st.current[i];
        s.px = s.bx + dx; s.py = s.by + dy;
        kickRef.current();
      },
      release: (i) => {
        st.current[i].drag = false;
        kickRef.current();
      },
    }),
    [],
  );

  /* محرك الفيزياء + رسم الخيوط */
  useEffect(() => {
    const S = st.current;
    let raf = 0;
    let last = 0;

    const tick = (now: number) => {
      raf = 0;
      const dt = last ? Math.min(2, (now - last) / 16.67) : 1;
      last = now;
      let busy = false;

      S.forEach((s, i) => {
        if (s.drag) {
          const nx = s.x + (s.px - s.x) * Math.min(1, 0.45 * dt);
          const ny = s.y + (s.py - s.y) * Math.min(1, 0.45 * dt);
          s.vx = (nx - s.x) / dt; s.vy = (ny - s.y) / dt;
          s.x = nx; s.y = ny;
        } else {
          const tx = PULL * ((S[i - 1]?.x ?? 0) + (S[i + 1]?.x ?? 0));
          const ty = PULL * ((S[i - 1]?.y ?? 0) + (S[i + 1]?.y ?? 0));
          const damp = Math.pow(DAMP, dt);
          s.vx = (s.vx + (tx - s.x) * STIFF * dt) * damp;
          s.vy = (s.vy + (ty - s.y) * STIFF * dt) * damp;
          s.x += s.vx * dt; s.y += s.vy * dt;
        }
        s.sc += ((s.drag ? 1.04 : 1) - s.sc) * 0.2 * dt;
        const rt = clamp(s.x * 0.05 + s.vx * 0.3, -14, 14);
        s.rot += (rt - s.rot) * 0.35 * dt;

        const settled =
          !s.drag && Math.abs(s.x) < 0.05 && Math.abs(s.y) < 0.05 && Math.abs(s.vx) < 0.05 &&
          Math.abs(s.vy) < 0.05 && Math.abs(s.sc - 1) < 0.002 && Math.abs(s.rot) < 0.05;
        const el = btns.current[i];
        if (settled) {
          s.x = s.y = s.vx = s.vy = s.rot = 0; s.sc = 1;
          if (el) el.style.transform = "";
        } else {
          busy = true;
          if (el) el.style.transform = `translate3d(${s.x}px, ${s.y}px, 0) rotate(${s.rot}deg) scale(${s.sc})`;
        }
      });

      /* الخيوط (بتتحسب بس لما الـ svg ظاهر: lg وفوق) */
      const w = wrap.current;
      if (w && isDesktop()) {
        const wr = w.getBoundingClientRect();
        const base = lis.current.map((li) => {
          if (!li) return { x: 0, y: 0, h: 0 };
          const r = li.getBoundingClientRect();
          return { x: r.left + r.width / 2 - wr.left, y: r.top + r.height / 2 - wr.top, h: li.offsetHeight };
        });
        const anchor = (i: number, k: number) => {
          const s = S[i];
          const ly = LEVERS[k] * base[i].h;
          const a = (s.rot * Math.PI) / 180;
          return { x: base[i].x + s.x - ly * Math.sin(a), y: base[i].y + s.y + ly * Math.cos(a) };
        };
        for (let i = 0; i < n - 1; i++) {
          for (let k = 0; k < LEVERS.length; k++) {
            const p = paths.current[i * LEVERS.length + k];
            if (!p) continue;
            const A = anchor(i, k);
            const B = anchor(i + 1, k);
            const d = Math.hypot(B.x - A.x, B.y - A.y);
            const d0 = Math.hypot(base[i + 1].x - base[i].x, base[i + 1].y - base[i].y);
            const L = d0 * SLACK + 8;
            const sag = Math.min(120, Math.sqrt(Math.max(0, L * L - d * d)));
            const cx = (A.x + B.x) / 2;
            const cy = (A.y + B.y) / 2 + sag;
            const ratio = d / L;
            const sw = ratio < 1 ? 4 : Math.max(1.4, 4 / Math.pow(ratio, 2.2)); // المطاط يرفّع لما يتشد
            p.setAttribute("d", `M${A.x} ${A.y} Q${cx} ${cy} ${B.x} ${B.y}`);
            p.setAttribute("stroke-width", String(sw));
          }
        }
      }

      if (busy) raf = requestAnimationFrame(tick);
      else last = 0;
    };

    const kick = () => {
      if (!raf) raf = requestAnimationFrame(tick);
    };
    kickRef.current = kick;
    kick();

    const ro = new ResizeObserver(kick);
    if (wrap.current) ro.observe(wrap.current);
    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      kickRef.current = () => {};
    };
  }, [n]);

  return (
    <section id="services" className="relative overflow-hidden px-6 pt-14 pb-20 md:pt-20 md:pb-28">
      <div className="relative mx-auto max-w-3xl text-center">
        <SectionNum n={2} className="mb-2 block text-[6rem] text-sand sm:text-[9rem]" />
        <p className="text-sm text-terra">{t("eyebrow")}</p>
        <h2 className="font-display text-4xl leading-tight sm:text-5xl md:text-7xl">{t.rich("title", { hl })}</h2>
        <span className="squiggle mx-auto mt-3 block w-44" />
        <p className="mt-6 text-ink/65">{t("sub")}</p>
      </div>

      <div ref={wrap} className="relative mx-auto mt-12 max-w-6xl lg:mt-20 lg:pt-12">
        {/* الخيوط (من ورا الكروت) */}
        <svg className="pointer-events-none absolute inset-0 hidden size-full overflow-visible text-terra lg:block" fill="none" aria-hidden>
          {Array.from({ length: (n - 1) * LEVERS.length }, (_, k) => (
            <path
              key={k}
              ref={(el) => {
                paths.current[k] = el;
              }}
              stroke="currentColor"
              strokeLinecap="round"
            />
          ))}
        </svg>

        <ul className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:flex lg:justify-center lg:gap-0">
          {items.map((it, i) => {
            const Icon = icons[i];
            const mid = i === 2;
            const onTerra = tones[i].includes("bg-terra");
            return (
              <DragCard
                key={i}
                index={i}
                poseClass={pose[i]}
                toneClass={tones[i]}
                api={api}
                setLi={(el) => {
                  lis.current[i] = el;
                }}
                setBtn={(el) => {
                  btns.current[i] = el;
                }}
                onOpen={() => setOpen(i)}
              >
                <SectionNum n={i + 1} className="outline-cur absolute end-6 top-6 text-2xl" />
                <span className={`absolute start-6 top-6 grid size-14 place-items-center rounded-2xl ${mid ? "bg-ink text-cream" : "bg-cream text-ink"}`}>
                  <Icon size={28} weight="duotone" />
                </span>

                {mid && (
                  <>
                    {/* موبايل/تابلت: شارة عادية جوه الكارت */}
                    <span className="mb-3 self-start rounded-full bg-terra px-3 py-1 font-note text-sm font-bold text-cream lg:hidden">{t("popular")}</span>

                    {/* ديسكتوب: الكلمة بالدايرة والسهم فوق الكارت */}
                    <span className="pointer-events-none absolute -top-10 start-1/2 z-10 hidden -translate-x-1/2 lg:block rtl:translate-x-1/2">
                      <span className="relative block -rotate-[4deg] whitespace-nowrap px-5 py-1.5 font-note text-xl font-bold text-terra">
                        {t("popular")}
                        {/* دايرة ماركر حوالين الكلمة */}
                        <svg viewBox="0 0 200 64" preserveAspectRatio="none" className="absolute inset-0 size-full overflow-visible" fill="none" aria-hidden>
                          <path
                            pathLength={1}
                            className="scribble"
                            d="M12 34C8 12 70 4 110 5C160 6 197 14 194 34C191 54 140 60 98 59C52 58 6 52 10 28C12 18 30 11 48 8"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            vectorEffect="non-scaling-stroke"
                          />
                        </svg>
                        {/* سهم صغير بيشاور على الكارت */}
                        <svg viewBox="0 0 40 52" className="absolute start-[68%] top-full mt-0.5 w-7 rtl:-scale-x-100" fill="none" aria-hidden>
                          <path
                            pathLength={1}
                            className="scribble"
                            style={{ animationDelay: "1.1s" }}
                            d="M6 4C16 16 22 28 28 44M17 40L28 46L33 32"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </span>
                    </span>
                  </>
                )}

                <h3 className="font-display text-3xl leading-snug lg:text-2xl xl:text-3xl">{it.t}</h3>
                <p className={`mt-3 text-sm leading-loose ${mid ? "text-ink/65" : "opacity-80"}`}>{it.d}</p>
                <span className={`mt-5 self-start border-b-2 pb-0.5 text-xs font-bold ${onTerra ? "border-cream text-cream" : "border-terra text-terra"}`}>
                  {t("more")} <span className="inline-block rtl:rotate-180">→</span>
                </span>
              </DragCard>
            );
          })}
        </ul>
      </div>

      {cur && open !== null && OpenIcon && (
        <ServiceModal
          key={open}
          index={open}
          title={cur.t}
          description={cur.d}
          points={cur.p}
          icon={<OpenIcon size={36} weight="regular" />}
          labels={{ close: t("close"), includes: t("includes"), cta: t("cta") }}
          onClose={() => setOpen(null)}
        />
      )}
    </section>
  );
}