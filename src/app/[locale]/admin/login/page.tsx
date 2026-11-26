import { setRequestLocale } from "next-intl/server";
import { LoginForm } from "@/components/admin/LoginForm";

export default async function LoginPage({ params }: { params: Promise<{ locale: string }> }) {
  setRequestLocale((await params).locale);
  return <LoginForm />;
}
