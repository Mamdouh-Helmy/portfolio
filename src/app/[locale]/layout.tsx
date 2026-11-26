import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageProvider } from "@/context/LanguageContext";
import { Providers } from "@/components/Providers";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });
  const b = await getTranslations({ locale, namespace: "Brand" });
  return { title: `${b("name")}`, description: t("sub"), alternates: { languages: { ar: "/ar", en: "/en" } } };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={fontVariables}>
      <body className="min-h-dvh antialiased">
        <NextIntlClientProvider>
          <LanguageProvider>
            <Providers>{children}</Providers>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
