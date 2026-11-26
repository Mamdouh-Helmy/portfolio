"use client";
import { createContext, use, useMemo, useTransition, type ReactNode } from "react";
import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import type { Locale } from "@/i18n/routing";

type Ctx = { locale: Locale; dir: "rtl" | "ltr"; isAr: boolean; pending: boolean; toggle: () => void; setLocale: (l: Locale) => void; num: (n: number) => string };
const LanguageContext = createContext<Ctx | null>(null);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [pending, start] = useTransition();

  const value = useMemo<Ctx>(() => {
    const setLocale = (l: Locale) => start(() => router.replace(pathname, { locale: l, scroll: false }));
    return {
      locale, pending, setLocale,
      dir: locale === "ar" ? "rtl" : "ltr",
      isAr: locale === "ar",
      toggle: () => setLocale(locale === "ar" ? "en" : "ar"),
      num: (n) => n.toLocaleString(locale === "ar" ? "ar-EG" : "en", { useGrouping: false }),
    };
  }, [locale, pending, pathname, router]);

  return <LanguageContext value={value}>{children}</LanguageContext>;
}

export const useLanguage = () => {
  const c = use(LanguageContext);
  if (!c) throw new Error("useLanguage must be used inside <LanguageProvider>");
  return c;
};
