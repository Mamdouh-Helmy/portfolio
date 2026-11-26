import Image from "next/image";
import { Star } from "@phosphor-icons/react/dist/ssr";
import { useLocale, useTranslations } from "next-intl";

const Tape = () => <span className="absolute -top-3 left-1/2 h-5 w-20 -translate-x-1/2 bg-terra" />;

export function Hero() {
  const t = useTranslations("Hero");
  const name = useTranslations("Brand")("name");
  const dir = useLocale() === "ar" ? "rtl" : "ltr";

  return (
    <section id="home" className="dots">
      <div className="mx-auto max-w-7xl px-6 pb-20 md:pb-28">
        <div className="flex items-center justify-between gap-4 border-b border-ink pt-0 pb-3">
          <span className="font-note text-lg font-bold text-terra sm:text-xl">{t("page")}</span>
          <span className="font-mono text-[10px] uppercase tracking-[.25em] text-ink/65 sm:text-xs" dir="ltr">portfolio / 2026</span>
        </div>

        <div dir="ltr" className="mt-10 grid items-center gap-14 sm:mt-12 lg:mt-15 lg:grid-cols-[1.15fr_.85fr] lg:gap-20">
          <div dir={dir} className="text-start">
            <h1 className={`inline-block font-display leading-[1.15] ${dir === "rtl" ? "text-6xl sm:text-7xl md:text-[8.5rem]" : "text-5xl sm:text-6xl md:text-[5.5rem]"}`}>
              {name}<span className="squiggle block" style={{ height: 12 }} />
            </h1>
            <p className="mt-8 font-display text-3xl text-terra sm:text-4xl md:mt-10 md:text-5xl">{t("title")}</p>
            <p className="mt-5 max-w-md text-base leading-loose text-ink/65 sm:text-lg md:mt-6">{t("sub")}</p>
            <div className="mt-10 flex flex-wrap gap-x-8 gap-y-5 text-lg font-semibold sm:text-xl md:mt-12 md:gap-x-10">
              <a href="#projects" className="border-b-[3px] border-terra pb-1">{t("work")} <span className="inline-block rtl:rotate-180">→</span></a>
              <a href="#contact" className="border-b-[3px] border-ink pb-1">{t("contact")}</a>
            </div>
          </div>

          <div className="portrait relative mx-auto w-full max-w-[17.5rem] sm:max-w-sm lg:max-w-[min(27rem,calc((100svh-14rem)/1.5))]">
            {/* الإطار الرفيع المزاح ورا القوس */}
            <div className="absolute inset-0 translate-x-3 translate-y-3 rounded-t-[999px] border border-terra sm:translate-x-4 sm:translate-y-4" />

            {/* القوس والشمس */}
            <div className="halftone relative aspect-[3/4] overflow-hidden rounded-t-[999px] border-2 border-ink">
              <div className="sun absolute left-1/2 top-[22%] aspect-square w-[70%] -translate-x-1/2 rounded-full border-2 border-ink" />
            </div>

            {/* الصورة: الراس بتطلع بره القوس */}
            <div className="cutout-wrap absolute inset-0 flex items-end justify-center" style={{ clipPath: "inset(-10% -10% 0 -10%)" }}>
              <Image
                src="/images/hero.webp"
                unoptimized
                alt={name}
                width={1086}
                height={1448}
                priority
                className="cutout h-auto w-[108%] max-w-none"
              />
            </div>

            {/* النجمة: z-10 عشان تفضل فوق الصورة، وعلى الحافة الشمال بعيد عن الشعر */}
            <Star weight="fill" className="absolute top-[8%] -left-2 z-10 size-7 -rotate-[10deg] text-terra sm:-left-6 sm:size-9" />

            {/* التاجز: z-10 عشان الصورة متغطيهمش، والإزاحة أقل على الموبايل عشان متخرجش برّه الشاشة */}
            <div dir={dir} className="absolute top-[60%] -right-2 z-10 rotate-[4deg] bg-cream px-3 py-2 text-sm font-medium shadow-lg shadow-ink/20 sm:-right-8 sm:px-5 sm:py-3 sm:text-base"><Tape />{t("tagFull")}</div>
            <div dir={dir} className="absolute top-[53%] -left-2 z-10 -rotate-[4deg] bg-sand px-3 py-2 text-sm font-note font-bold text-terra shadow-lg shadow-ink/20 sm:-left-14 sm:px-5 sm:py-3 sm:text-base"><Tape />{t("tagAlive")}</div>
            <div className="absolute -right-2 bottom-6 z-10 -rotate-[3deg] bg-ink px-3 py-2 font-mono text-xs text-cream shadow-lg shadow-ink/30 sm:-right-8 sm:px-5 sm:py-3 sm:text-sm"><Tape />React · Next.js</div>
          </div>
        </div>
      </div>
    </section>
  );
}