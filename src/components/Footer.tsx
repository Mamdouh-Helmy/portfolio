"use client";
import { ArrowUp } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { useActiveSection } from "@/hooks/useActiveSection";
import { SocialIcon } from "./SocialIcon";
import { LangSwitch } from "./LangSwitch";

const ids = ["home", "about", "services", "projects", "certificates", "contact"] as const;
const col = "font-note text-xl font-bold text-terra";

export function Footer() {
  const t = useTranslations("Footer");
  const n = useTranslations("Nav");
  const b = useTranslations("Brand");
  const active = useActiveSection(ids);

  const Link = ({ id }: { id: (typeof ids)[number] }) => {
    const on = active === id;
    return (
      <a href={`#${id}`} aria-current={on ? "true" : undefined} className={`group relative inline-flex items-center gap-2 pb-1 transition-colors ${on ? "text-terra" : "hover:text-terra"}`}>
        <span className={`size-1.5 rounded-full bg-terra transition-transform duration-300 ${on ? "scale-100" : "scale-0"}`} />
        {n(id)}
        <span className={`absolute -bottom-0.5 start-0 h-px bg-terra transition-all duration-500 ${on ? "w-full" : "w-0 group-hover:w-full"}`} />
      </a>
    );
  };

  return (
    <footer className="weave rounded-t-[2rem] bg-ink text-cream md:rounded-t-[3rem]">
      <div className="mx-auto max-w-6xl px-6 pt-14 pb-8 md:pt-20">
        <div className="flex items-start justify-between gap-4 sm:gap-6">
          <div className="min-w-0">
            <p className="font-display text-5xl leading-tight sm:text-6xl md:text-8xl">{b("first")} <span className="text-terra">{b("last")}</span></p>
            <p className="mt-4 text-sm text-sand">{t("tagline")}</p>
          </div>
          <a href="#home" aria-label={t("up")} className="mt-2 grid size-12 shrink-0 place-items-center rounded-full bg-terra transition-transform hover:-translate-y-1 sm:mt-4 sm:size-16"><ArrowUp size={24} weight="bold" /></a>
        </div>
        <div className="mt-10 grid gap-8 border-t border-cream/15 pt-10 sm:grid-cols-2 md:mt-14 md:gap-10 lg:grid-cols-4">
          <div><h3 className={col}>{t("quick")}</h3><ul className="mt-5 space-y-3 text-sm">
            {(["about", "services", "projects"] as const).map((k) => <li key={k}><Link id={k} /></li>)}</ul></div>
          <div><h3 className={col}>{t("more")}</h3><ul className="mt-5 space-y-3 text-sm">
            <li><Link id="certificates" /></li>
            <li><Link id="contact" /></li>
            <li><a className="hover:text-terra" href={site.cv}>{t("cv")}</a></li></ul></div>
          <div><h3 className={col}>{t("social")}</h3><ul className="mt-5 flex flex-wrap gap-2">
            {site.socials.map((s) => <li key={s.id}><a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.id} className="grid size-10 place-items-center rounded-full border border-cream/30 transition-transform hover:-translate-y-1 hover:border-terra hover:text-terra"><SocialIcon id={s.id} /></a></li>)}</ul></div>
          <div><h3 className={col}>{t("language")}</h3><div className="mt-5"><LangSwitch variant="dark" /></div></div>
        </div>
        <div className="mt-10 border-t border-cream/15 pt-6 text-center text-xs text-cream/65 md:mt-14">
          <span>{t("rights")}</span><span></span>
        </div>
      </div>
    </footer>
  );
}