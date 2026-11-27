import { redirect } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/admin/LoginForm";
import { getAdmin } from "@/lib/require-admin";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  if (await getAdmin()) redirect(`/${locale}/admin`);
  return <LoginForm />;
}