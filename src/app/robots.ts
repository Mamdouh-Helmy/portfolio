import type { MetadataRoute } from "next";

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://portfolio-chi-beige-93.vercel.app";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/", disallow: ["/api/", "/ar/admin", "/en/admin"] },
    sitemap: `${SITE_URL}/sitemap.xml`,
  };
}