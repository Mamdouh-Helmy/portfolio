"use client";
import { useEffect, useRef, useState, type ComponentProps } from "react";
import { CalendarCheck, EnvelopeSimple, MapPin, WhatsappLogo, Phone, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";
import { useTranslations } from "next-intl";
import { site } from "@/data/site";
import { useZodForm } from "@/hooks/useForm";
import { useSendContact } from "@/hooks/useAuth";
import { contactSchema } from "@/lib/validation";
import { SocialIcon } from "@/components/SocialIcon";
import { Field } from "@/components/Field";
import { SendingOverlay } from "@/components/SendingOverlay";
import { SectionNum, hl } from "@/components/SectionNum";

const MIN_LOADING = 1400; // أقل وقت للـ loading عشان مايومضش بسرعة
const SENT_TIME = 2500; // مدة رسالة النجاح

export function Contact() {
  const t = useTranslations("Contact");
  const v = useTranslations("Validation");
  const form = useZodForm(contactSchema, { name: "", email: "", message: "" });
  const send = useSendContact();
  const [phase, setPhase] = useState<"idle" | "sending" | "sent">("idle");
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  const busy = phase !== "idle";
  useEffect(() => () => clearTimeout(timer.current), []);

  const submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (e) => {
    e.preventDefault();
    if (busy || !form.validate()) return;
    setPhase("sending");
    const started = Date.now();
    const afterLoading = (done: () => void) => {
      timer.current = setTimeout(done, Math.max(0, MIN_LOADING - (Date.now() - started)));
    };
    send.mutate(form.values, {
      onSuccess: () => afterLoading(() => {
        form.reset();
        setPhase("sent");
        timer.current = setTimeout(() => setPhase("idle"), SENT_TIME);
      }),
      onError: (err) => afterLoading(() => {
        form.applyServerError(err);
        setPhase("idle");
      }),
    });
  };
  const rows = [
    { I: EnvelopeSimple, l: t("email"), val: site.email, ltr: true },
    { I: Phone, l: t("phone"), val: site.phone, ltr: true },
    { I: MapPin, l: t("location"), val: t("locationValue"), ltr: false },
  ];
  const e = (k: "name" | "email" | "message") => form.errors[k]?.[0] && v(form.errors[k]![0]);

  return (
    <section id="contact" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 md:py-28">
      {/* items-stretch: العمودين ياخدوا نفس الطول، والأطول هو اللي بيحدد */}
      <div className="grid gap-5 lg:grid-cols-[1.25fr_1fr] lg:items-stretch">
        {/* الكارت الداكن: flex-col عشان السوشيال تنزل لآخره */}
        <div className="weave relative flex flex-col overflow-hidden rounded-[1.5rem] bg-ink p-6 text-cream shadow-2xl shadow-ink/25 sm:rounded-[2rem] sm:p-9 md:p-12">
          <SectionNum n={5} className="outline-cur absolute -bottom-6 -left-1 text-[6rem] text-terra sm:-bottom-10 sm:text-[9rem]" />
          <p className="text-xs text-terra">{t("eyebrow")}</p>
          <h2 className="mt-2 font-display text-4xl leading-tight sm:text-5xl md:text-6xl">{t.rich("title", { hl })}</h2>
          <span className="squiggle mt-3 block w-44" />
          <p className="mt-6 text-sand sm:mt-8">{t("sub")}</p>
          <ul className="mt-8 space-y-5 sm:mt-10">
            {rows.map(({ I, l, val, ltr }) => (
              <li key={l} className="flex items-center gap-4">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-cream/10 text-terra sm:size-12"><I size={22} weight="duotone" /></span>
                <span className="min-w-0"><span className="block text-[11px] text-cream/65">{l}</span><span className="block break-words font-bold" dir={ltr ? "ltr" : undefined}>{val}</span></span>
              </li>
            ))}
          </ul>
          {/* mt-auto: السوشيال دايمًا في آخر الكارت مهما طال */}
          <ul className="relative mt-auto flex flex-wrap gap-3 pt-10">
            {site.socials.map((s) => <li key={s.id}><a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={s.id} className="grid size-10 place-items-center rounded-full border border-cream/30 hover:border-terra hover:text-terra"><SocialIcon id={s.id} /></a></li>)}
          </ul>
        </div>

        {/* العمود التاني: flex-col والفورم flex-1 */}
        <div className="flex flex-col gap-4">
          <a href={site.whatsapp} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-terra p-4 text-cream shadow-lg shadow-terra/30 sm:gap-4 sm:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-cream text-terra sm:size-12"><WhatsappLogo size={26} weight="fill" /></span>
            <span className="min-w-0 flex-1"><b className="block font-display text-xl sm:text-2xl">{t("whatsapp")}</b><span className="text-xs opacity-90">{t("whatsappSub")}</span></span>
            <span className="rtl:rotate-180">→</span>
          </a>
          <a href={site.booking} target="_blank" rel="noopener noreferrer" className="flex items-center justify-between gap-3 rounded-2xl bg-sand p-4 sm:gap-4 sm:p-5">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-ink text-cream sm:size-12"><CalendarCheck size={24} weight="duotone" /></span>
            <span className="min-w-0 flex-1"><b className="block font-display text-xl sm:text-2xl">{t("book")}</b><span className="text-xs text-ink/65">{t("bookSub")}</span></span>
            <span className="text-terra rtl:rotate-180">→</span>
          </a>
          <form onSubmit={submit} noValidate className="relative flex flex-1 flex-col gap-4 rounded-2xl border border-ink/10 bg-cream p-4 shadow-xl shadow-ink/10 sm:p-6">
            {/* disabled وقت الإرسال عشان محدش يكتب أو يبعت مرتين */}
            <fieldset disabled={busy} className="contents">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label={t("name")} error={e("name")}><input value={form.values.name} onChange={form.set("name")} placeholder={t("namePh")} autoComplete="name" className="input" /></Field>
              <Field label={t("emailLabel")} error={e("email")}><input type="email" dir="ltr" value={form.values.email} onChange={form.set("email")} placeholder="you@email.com" autoComplete="email" className="input" /></Field>
            </div>
            {/* flex-1 على الـ Field نفسه، والـ textarea ياخد h-full */}
            <div className="flex flex-1 flex-col [&>*]:flex [&>*]:flex-1 [&>*]:flex-col">
              <Field label={t("message")} error={e("message")}><textarea rows={4} value={form.values.message} onChange={form.set("message")} placeholder={t("messagePh")} className="input min-h-32 flex-1 resize-none" /></Field>
            </div>
            <button className="flex w-full items-center justify-center gap-2 rounded-full bg-ink py-3.5 font-bold text-cream transition hover:bg-terra">
              <PaperPlaneTilt size={18} weight="fill" className="rtl:-scale-x-100" />{t("send")}
            </button>
            </fieldset>
            <p role="status" className="text-sm">
              {phase === "sending" && <span className="sr-only">{t("sending")}</span>}
              {phase === "sent" && <span className="sr-only">{t("sent")}</span>}
              {phase === "idle" && send.isError && !form.errors.name && <span className="text-terra">{t("failed")}</span>}
            </p>
            {phase !== "idle" && <SendingOverlay phase={phase} sendingText={t("sending")} sentText={t("sent")} />}
          </form>
        </div>
      </div>
    </section>
  );
}