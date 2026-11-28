"use client";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { useLanguage } from "@/context/LanguageContext";
import { useActiveSection } from "@/hooks/useActiveSection";
import { LangSwitch } from "@/components/LangSwitch";

const links = ["home", "about", "services", "projects", "certificates", "contact"] as const;

export function Header() {
  const t = useTranslations();
  const { locale } = useLanguage();
  const active = useActiveSection(links);
  const navRef = useRef<HTMLElement>(null);
  const [mark, setMark] = useState({ left: 0, width: 0 });
  const [ready, setReady] = useState(false);
  const [menu, setMenu] = useState(false);

  useEffect(() => {
    const nav = navRef.current;
    if (!nav) return;
    const measure = () => {
      const a = nav.querySelector<HTMLElement>(`[data-id="${active}"]`);
      if (a) {
        const pad = parseFloat(getComputedStyle(a).paddingLeft) || 0;
        setMark({ left: a.offsetLeft + pad, width: Math.max(0, a.offsetWidth - pad * 2) });
        requestAnimationFrame(() => setReady(true));
      }
    };
    measure();
    const ro = new ResizeObserver(measure);
    ro.observe(nav);
    document.fonts?.ready.then(measure);
    return () => ro.disconnect();
  }, [active, locale]);

  useEffect(() => {
    if (!menu) return;
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setMenu(false);
    const mq = window.matchMedia("(min-width: 1024px)");
    const onMq = () => mq.matches && setMenu(false);
    window.addEventListener("keydown", onKey);
    mq.addEventListener("change", onMq);
    return () => {
      window.removeEventListener("keydown", onKey);
      mq.removeEventListener("change", onMq);
    };
  }, [menu]);

  return (
    <header className={`sticky top-0 z-50 ${menu ? "bg-cream" : "bg-cream/90 backdrop-blur"}`}>
      <div className="relative z-10 mx-auto flex max-w-7xl items-center justify-between gap-3 bg-cream/0 px-4 py-3 sm:gap-6 sm:px-6 md:py-5">
        <a href="#home" className="flex shrink-0 items-center gap-4" aria-label={t("Brand.name")}>
          <span className="grid size-11 shrink-0 place-items-center rounded-full border border-ink font-display text-xl sm:size-14 sm:text-2xl">{t("Brand.initial")}</span>
          <span className="hidden whitespace-nowrap font-note text-2xl font-bold xl:inline">{t("Brand.name")}</span>
        </a>

        <nav ref={navRef} className="relative hidden shrink-0 items-center text-base font-medium lg:flex xl:text-[17px]" aria-label="Main">
          <span
            aria-hidden
            className={`squiggle absolute -bottom-1 ${ready ? "transition-[left,width] duration-500 ease-[cubic-bezier(.65,0,.2,1)]" : ""}`}
            style={{ left: mark.left, width: mark.width, opacity: mark.width ? 1 : 0 }}
          />
          {links.map((l) => (
            <a
              key={l}
              data-id={l}
              href={`#${l}`}
              aria-current={active === l ? "true" : undefined}
              className={`relative z-10 px-3 py-2.5 transition-colors duration-300 hover:text-terra xl:px-5 ${active === l ? "text-terra" : ""}`}
            >
              {t(`Nav.${l}`)}
            </a>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-4 sm:gap-7">
          <LangSwitch variant="light" />
          <a href="#contact" className="hidden flex-col items-center font-display text-2xl leading-none sm:flex">{t("Nav.cta")}<span className="squiggle mt-1 w-16" /></a>
          <button
            type="button"
            onClick={() => setMenu((o) => !o)}
            aria-expanded={menu}
            aria-controls="mobile-nav"
            aria-label={t("Nav.menu")}
            className="grid size-11 place-items-center rounded-full border border-ink lg:hidden"
          >
            <span aria-hidden className="relative block h-3 w-5">
              <span className={`absolute inset-x-0 h-0.5 rounded bg-ink transition-all duration-300 ${menu ? "top-1/2 -translate-y-1/2 rotate-45" : "top-0"}`} />
              <span className={`absolute inset-x-0 h-0.5 rounded bg-ink transition-all duration-300 ${menu ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-0"}`} />
            </span>
          </button>
        </div>
      </div>

      <button
        type="button"
        tabIndex={-1}
        aria-hidden
        onClick={() => setMenu(false)}
        className={`fixed inset-0 -z-10 cursor-default bg-ink/40 transition-opacity duration-500 ease-out motion-reduce:transition-none lg:hidden ${menu ? "opacity-100" : "pointer-events-none opacity-0"}`}
      />

      <nav
        id="mobile-nav"
        aria-label="Mobile"
        className={`absolute inset-x-0 top-full max-h-[calc(100dvh-4.5rem)] overflow-y-auto border-t border-ink/15 bg-cream transition-[clip-path,visibility] duration-500 ease-[cubic-bezier(.65,0,.2,1)] motion-reduce:transition-none lg:hidden ${
          menu ? "visible [clip-path:inset(0)]" : "invisible [clip-path:inset(0_0_100%_0)]"
        }`}
      >
        <ul className="mx-auto flex max-w-7xl flex-col px-4 py-3 sm:px-6">
          {links.map((l, i) => (
            <li
              key={l}
              className={`border-b border-ink/10 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] last:border-0 motion-reduce:transition-none ${
                menu ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
              }`}
              style={{ transitionDelay: menu ? `${120 + i * 50}ms` : "0ms" }}
            >
              <a
                href={`#${l}`}
                onClick={() => setMenu(false)}
                aria-current={active === l ? "true" : undefined}
                className={`flex items-center justify-between py-4 font-display text-2xl transition-colors hover:text-terra ${active === l ? "text-terra" : ""}`}
              >
                {t(`Nav.${l}`)}
                <span className="text-base rtl:rotate-180">→</span>
              </a>
            </li>
          ))}
          <li
            className={`pt-4 transition-[opacity,transform] duration-500 ease-[cubic-bezier(.2,.8,.2,1)] motion-reduce:transition-none sm:hidden ${
              menu ? "translate-y-0 opacity-100" : "-translate-y-3 opacity-0"
            }`}
            style={{ transitionDelay: menu ? `${120 + links.length * 50}ms` : "0ms" }}
          >
            <a href="#contact" onClick={() => setMenu(false)} className="block rounded-full bg-ink py-3.5 text-center font-display text-xl text-cream">{t("Nav.cta")}</a>
          </li>
        </ul>
      </nav>
    </header>
  );
}