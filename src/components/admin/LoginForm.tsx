"use client";
import { useState, type ComponentProps, type CSSProperties } from "react";
import Image from "next/image";
import { useLocale, useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useLogin } from "@/hooks/useAuth";
import { useZodForm } from "@/hooks/useForm";
import { ApiError } from "@/lib/fetcher";
import { loginSchema } from "@/lib/validation";

const COPY = {
  ar: { pass: "تصريح دخول", hello: "أهلًا بيك في الكواليس", staff: "للإدارة فقط", back: "ارجع للموقع", show: "اظهر", hide: "اخفي", failed: "حصلت مشكلة، حاول تاني" },
  en: { pass: "Backstage pass", hello: "Welcome behind the scenes", staff: "Staff only", back: "Back to site", show: "Show", hide: "Hide", failed: "Something went wrong, try again" },
};

const delay = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

const inputClass =
  "w-full border-b-2 border-ink/20 bg-transparent py-3 text-base outline-none transition-colors focus:border-terra aria-invalid:border-terra";

export function LoginForm() {
  const t = useTranslations("Admin");
  const v = useTranslations("Validation");
  const c = COPY[useLocale() === "ar" ? "ar" : "en"];
  const router = useRouter();
  const login = useLogin();
  const form = useZodForm(loginSchema, { email: "", password: "" });
  const [msg, setMsg] = useState("");
  const [show, setShow] = useState(false);

  const submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (e) => {
    e.preventDefault();
    setMsg("");
    if (!form.validate()) return;
    login.mutate(form.values, {
      onSuccess: () => router.replace("/admin"),
      onError: (err) => {
        form.applyServerError(err);
        const status = err instanceof ApiError ? err.status : 0;
        if (status === 429) setMsg(t("tooMany"));
        else if (status === 401) setMsg(t("invalid"));
        else if (status === 0 || status >= 500) setMsg(c.failed);
      },
    });
  };

  const emailError = form.errors.email?.[0];
  const passwordError = form.errors.password?.[0];

  return (
    <main className="dots relative grid min-h-dvh place-items-center overflow-hidden px-4 py-10">
      <div aria-hidden className="sun absolute -end-24 -top-24 size-72 rounded-full opacity-90" />
      <div aria-hidden className="absolute -bottom-32 -start-24 size-80 rounded-full bg-sand" />

      <div className="relative w-full max-w-sm md:max-w-4xl">
        <div className="drop-shadow-2xl">
          <div className="ticket sheet-in grid overflow-hidden rounded-3xl bg-cream md:min-h-[38rem] md:grid-cols-[42.5%_1fr]">
            {/* الكعب: الصورة */}
            <aside className="portrait weave relative hidden overflow-hidden bg-ink text-cream md:block">
              <div className="relative z-10 p-8">
                <p className="font-note text-lg text-sand">{c.pass}</p>
                <p className="font-display mt-1 text-2xl leading-snug">{c.hello}</p>
              </div>
              <div aria-hidden className="sun absolute bottom-16 left-1/2 aspect-square w-[85%] -translate-x-1/2 rounded-full" />
              <div className="cutout-wrap absolute inset-x-0 -bottom-1.5 aspect-[4/5]">
                <Image src="/images/about-portrait.webp" alt="" fill priority sizes="400px" className="cutout object-contain object-bottom" />
              </div>
            </aside>

            {/* الفورم */}
            <form onSubmit={submit} noValidate className="paper relative flex flex-col justify-center gap-6 border-dashed border-ink/25 px-7 py-10 md:border-s-2 md:px-12">
              <div className="rise flex items-start justify-between gap-4" style={delay(150)}>
                <div>
                  <h1 className="font-display text-4xl">{t("loginTitle")}</h1>
                  <div aria-hidden className="squiggle mt-2 w-24" />
                </div>
                <span className="stamp-in shrink-0 rounded-lg border-2 border-terra px-3 py-1 text-xs font-bold uppercase text-terra">
                  {c.staff}
                </span>
              </div>

              <div className="rise" style={delay(250)}>
                <label htmlFor="email" className="text-sm font-semibold">Email</label>
                <input
                  id="email" type="email" dir="ltr" autoComplete="username"
                  value={form.values.email} onChange={form.set("email")}
                  aria-invalid={!!emailError} aria-describedby={emailError ? "email-error" : undefined}
                  className={inputClass}
                />
                {emailError && <p id="email-error" className="mt-1 text-sm text-terra">{v(emailError)}</p>}
              </div>

              <div className="rise" style={delay(350)}>
                <label htmlFor="password" className="text-sm font-semibold">{t("password")}</label>
                <div className="relative" dir="ltr">
                  <input
                    id="password" type={show ? "text" : "password"} autoComplete="current-password"
                    value={form.values.password} onChange={form.set("password")}
                    aria-invalid={!!passwordError} aria-describedby={passwordError ? "password-error" : undefined}
                    className={`${inputClass} pr-16`}
                  />
                  <button
                    type="button" onClick={() => setShow((s) => !s)} aria-controls="password"
                    className="absolute right-0 top-1/2 -translate-y-1/2 rounded-full bg-sand px-3 py-1 text-xs font-semibold"
                  >
                    {show ? c.hide : c.show}
                  </button>
                </div>
                {passwordError && <p id="password-error" className="mt-1 text-sm text-terra">{v(passwordError)}</p>}
              </div>

              {msg && (
                <p role="alert" className="swap rounded-xl border-2 border-dashed border-terra bg-terra/10 px-4 py-2 text-sm text-terra">
                  {msg}
                </p>
              )}

              <div className="rise" style={delay(450)}>
                <button
                  disabled={login.isPending}
                  className="group flex w-full items-center justify-center gap-3 rounded-full bg-ink py-3.5 font-semibold text-cream transition hover:-translate-y-0.5 hover:bg-terra disabled:translate-y-0 disabled:opacity-60"
                >
                  {login.isPending ? t("loggingIn") : t("login")}
                  {login.isPending ? (
                    <span aria-hidden className="size-4 animate-spin rounded-full border-2 border-cream border-t-transparent" />
                  ) : (
                    <span aria-hidden className="transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1">→</span>
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-4">
                <Link href="/" className="text-sm underline decoration-terra underline-offset-4">{c.back}</Link>
                <div aria-hidden className="barcode w-28" />
              </div>
            </form>
          </div>
        </div>
      </div>
    </main>
  );
}