import type { Metadata, Viewport } from "next";
import { notFound } from "next/navigation";
import { hasLocale, NextIntlClientProvider } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { LanguageProvider } from "@/context/LanguageContext";
import { Providers } from "@/components/Providers";
import { routing } from "@/i18n/routing";
import { fontVariables } from "@/lib/fonts";
import "../globals.css";

type Props = { children: React.ReactNode; params: Promise<{ locale: string }> };

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-chi-beige-93.vercel.app";
const OG_IMAGE = "/images/og-image.jpg";

export const generateStaticParams = () => routing.locales.map((locale) => ({ locale }));

export const viewport: Viewport = {
  themeColor: "#0b1020",
  width: "device-width",
  initialScale: 1,
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Hero" });
  const b = await getTranslations({ locale, namespace: "Brand" });

  const name = b("name");
  const description = t("sub");
  const isAr = locale === "ar";

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: name, template: `%s | ${name}` },
    description,
    applicationName: name,
    authors: [{ name }],
    creator: name,
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: "/ar", en: "/en", "x-default": "/en" },
    },
    openGraph: {
      type: "website",
      url: `/${locale}`,
      siteName: name,
      title: name,
      description,
      locale: isAr ? "ar_EG" : "en_US",
      alternateLocale: [isAr ? "en_US" : "ar_EG"],
      images: [{ url: OG_IMAGE, width: 1200, height: 630, alt: name }],
    },
    twitter: {
      card: "summary_large_image",
      title: name,
      description,
      images: [OG_IMAGE],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, "max-image-preview": "large", "max-snippet": -1 },
    },
  };
}

export default async function LocaleLayout({ children, params }: Props) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);

  const b = await getTranslations({ locale, namespace: "Brand" });
  const t = await getTranslations({ locale, namespace: "Hero" });

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: b("name"),
    description: t("sub"),
    url: `${SITE_URL}/${locale}`,
    image: `${SITE_URL}${OG_IMAGE}`,
    jobTitle: "Full-Stack Developer",
  };

  return (
    <html lang={locale} dir={locale === "ar" ? "rtl" : "ltr"} className={fontVariables}>
      <body className="min-h-dvh antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <NextIntlClientProvider>
          <LanguageProvider>
            <Providers>{children}</Providers>
          </LanguageProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}