"use client";
import Image from "next/image";
import { useRef, useState, type MouseEvent } from "react";
import { useLenis } from "lenis/react";
import { useTranslations } from "next-intl";
import { useProjects } from "@/hooks/useProjects";
import { useLanguage } from "@/context/LanguageContext";
import { SectionNum, hl } from "@/components/SectionNum";

const img = (u: string) => ({ unoptimized: u.endsWith(".svg") });
const easeInOut = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);
const wrap = "mx-auto w-full max-w-6xl px-6 md:px-14";

const track = (e: MouseEvent<HTMLLIElement>) => {
  const r = e.currentTarget.getBoundingClientRect();
  e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
  e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
};

type Localized = { ar?: string; en?: string } | null | undefined;

export function Projects() {
  const t = useTranslations("Projects");
  const { locale, num } = useLanguage();
  const { data, isPending, isError } = useProjects();
  const [picked, setPicked] = useState<string>();
  const current = data?.find((p) => String(p._id) === picked) ?? data?.[0];
  const lenis = useLenis();
  const detailRef = useRef<HTMLElement>(null);

  const tx = (o: Localized) => (o as Record<string, string | undefined> | null | undefined)?.[locale] ?? "";

  const pick = (id: string) => {
    setPicked(id);
    const el = detailRef.current;
    if (!el) return;
    if (lenis) lenis.scrollTo(el, { offset: -110, duration: 1.6, easing: easeInOut });
    else el.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <section id="projects" className="w-full overflow-x-clip bg-sand py-16 md:py-24">
      <div className={wrap}>
        <div className="flex flex-wrap items-end justify-between gap-6 md:gap-8">
          <div className="flex items-end gap-3 sm:gap-5">
            <SectionNum n={3} className="outline-num text-6xl sm:text-8xl md:text-9xl" />
            <div>
              <p className="text-sm text-terra">{t("eyebrow")}</p>
              <h2 className="font-display text-4xl leading-tight sm:text-5xl md:text-6xl">{t.rich("title", { hl })}</h2>
              <span className="squiggle mt-2 block w-44" />
            </div>
          </div>
          <div className="max-w-xs text-sm leading-loose text-ink/65">
            <p>{t("sub")}</p>
            <a href="#projects" className="mt-3 inline-block border-b border-ink pb-0.5 font-bold text-ink">{t("all")}</a>
          </div>
        </div>

        {isPending && <div className="mt-10 h-80 animate-pulse rounded-3xl bg-ink/10 md:mt-14" />}
        {isError && <p role="alert" className="mt-10 text-terra md:mt-14">{t("error")}</p>}
        {data?.length === 0 && <p className="mt-10 text-ink/65 md:mt-14">{t("empty")}</p>}{current && (
          <article key={String(current._id)} ref={detailRef} className="swap mt-10 grid overflow-hidden rounded-3xl bg-ink text-cream shadow-2xl shadow-ink/30 md:mt-14 md:grid-cols-[1fr_1.25fr]">
            <div className={`bg-terra p-3 sm:p-4 md:p-5 ${current.videoUrl ? "flex items-center" : ""}`}>
              {current.videoUrl ? (
                <video
                  key={current.videoUrl}
                  src={current.videoUrl.replace("/upload/", "/upload/q_auto/")}
                  autoPlay
                  muted
                  loop
                  playsInline
                  preload="auto"
                  disablePictureInPicture
                  aria-label={tx(current.title)}
                  className="block h-auto w-full rounded-2xl"
                />
              ) : (
                <Image src={current.imageUrl} alt={tx(current.title)} width={1400} height={788} {...img(current.imageUrl)} className="aspect-video size-full rounded-2xl border-2 border-cream/60 object-contain" />
              )}
            </div>
            <div className="weave flex min-w-0 flex-col justify-center gap-5 p-6 sm:p-8 md:p-12">
              <div className="flex flex-wrap items-center gap-3 text-xs">
                {current.featured && <span className="rounded-full bg-terra px-3 py-1 font-bold">★ {t("featured")}</span>}
                {(current.category || current.year) && <span className="font-mono text-cream/65" dir="ltr">{[current.category, current.year].filter(Boolean).join(" · ")}</span>}
              </div>
              <h3 className="font-display text-3xl leading-tight sm:text-4xl md:text-5xl">{tx(current.title)}</h3>
              <p className="max-w-md text-sm leading-loose text-sand">{tx(current.description)}</p>
              <ul className="flex flex-wrap gap-2">{current.tags?.map((g) => <li key={g} className="rounded-full border border-cream/25 px-3 py-1 text-[11px] font-semibold">{g}</li>)}</ul>
              {(current.metrics?.length ?? 0) > 0 && (
                <dl className="flex flex-wrap gap-x-8 gap-y-4 border-t border-cream/15 pt-5 sm:gap-x-10">
                  {current.metrics?.map((m) => (
                    <div key={m.value}><dd className="font-display text-3xl text-terra sm:text-4xl" dir="ltr">{m.value}</dd><dt className="text-[11px] text-cream/65">{locale === "ar" ? m.ar : m.en}</dt></div>
                  ))}
                </dl>
              )}
              <div className="flex flex-wrap gap-3">
                {current.link && <a href={current.link} target="_blank" rel="noopener noreferrer" className="rounded-full bg-terra px-6 py-3 text-sm font-bold">{t("view")} <span className="inline-block rtl:rotate-180">→</span></a>}
                {current.repo && <a href={current.repo} target="_blank" rel="noopener noreferrer" className="rounded-full border border-cream/30 px-6 py-3 text-sm font-bold">{t("source")}</a>}
              </div>
            </div>
          </article>
        )}
      </div>
      <ol className="mt-10 border-t border-ink/20 md:mt-12">
        {data?.map((p, i) => {
          const active = p._id === current?._id;
          return (
            <li key={String(p._id)} onMouseEnter={track} onMouseMove={track} className="group relative w-full border-b border-ink/20">
              <button
                onClick={() => pick(String(p._id))}
                aria-current={active}
                className="relative block w-full overflow-hidden text-start"
              >
                <span aria-hidden className="absolute inset-0 origin-bottom scale-y-0 bg-ink transition-transform duration-500 ease-[cubic-bezier(.65,0,.2,1)] group-hover:scale-y-100 group-focus-visible:scale-y-100" />

                <span className={`relative block ${wrap}`}>
                  <span className="flex items-center gap-3 py-5 transition-[padding] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:px-3 group-focus-visible:px-3 sm:gap-5 sm:py-7 sm:group-hover:px-5 sm:group-focus-visible:px-5">
                    <span className={`w-10 shrink-0 font-display text-3xl transition-colors duration-500 sm:w-16 sm:text-5xl ${active ? "text-terra" : "outline-num"}`}>{num(i + 1).padStart(2, locale === "ar" ? "٠" : "0")}</span>
                    <span className="min-w-0 flex-1 transition-colors duration-500 group-hover:text-cream group-focus-visible:text-cream">
                      <span className="block font-display text-2xl sm:text-3xl">{tx(p.title)}</span>
                      <span className="mt-1 line-clamp-2 block max-w-lg text-xs text-ink/65 transition-colors duration-500 group-hover:text-cream/70 group-focus-visible:text-cream/70">{tx(p.description)}</span>
                    </span>
                    <span className="hidden gap-2 lg:flex" dir="ltr">{p.tags?.slice(0, 3).map((g) => <span key={g} className="rounded-full bg-cream px-3 py-1 text-[11px] font-semibold text-ink">{g}</span>)}</span>
                    <span className={`grid size-9 shrink-0 place-items-center rounded-full border transition-all duration-500 sm:size-11 ${active ? "border-terra bg-terra text-cream" : "border-ink/40 group-hover:rotate-45 group-hover:border-terra group-hover:bg-terra group-hover:text-cream"}`}><span className="rtl:rotate-180">↗</span></span>
                  </span>
                </span>
              </button>

              <span
                aria-hidden
                className="pointer-events-none absolute top-0 left-0 z-20 hidden md:block [transform:translate3d(var(--mx,50%),var(--my,50%),0)] [transition:transform_.6s_cubic-bezier(.2,.8,.2,1)]"
              >
                <span className="ml-8 -mt-40 block w-56 origin-bottom-left scale-50 -rotate-12 opacity-0 drop-shadow-2xl [clip-path:inset(32%_round_1.5rem)] transition-[opacity,scale,rotate,clip-path] duration-700 ease-[cubic-bezier(.2,.8,.2,1)] group-hover:scale-100 group-hover:-rotate-6 group-hover:opacity-100 group-hover:[clip-path:inset(0%_round_1.5rem)]">
                  <Image src={p.imageUrl} alt="" width={448} height={252} {...img(p.imageUrl)} className="aspect-video w-full rounded-3xl border-4 border-cream object-cover" />
                </span>
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}