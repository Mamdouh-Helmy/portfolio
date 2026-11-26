import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-chi-beige-93.vercel.app";

export default function sitemap(): MetadataRoute.Sitemap {
  return ["ar", "en"].map((locale) => ({
    url: `${SITE_URL}/${locale}`,
    lastModified: new Date(),
    changeFrequency: "monthly",
    priority: 1,
    alternates: { languages: { ar: `${SITE_URL}/ar`, en: `${SITE_URL}/en` } },
  }));
}