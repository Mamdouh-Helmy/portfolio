// src/app/[locale]/admin/page.tsx — فحص على السيرفر كطبقة تانية بعد proxy.ts
import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Dashboard } from "@/components/admin/Dashboard";
import { getAdmin } from "@/lib/auth";

export default async function AdminPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (!(await getAdmin())) redirect(`/${locale}/admin/login`);
  return <Dashboard />;
}