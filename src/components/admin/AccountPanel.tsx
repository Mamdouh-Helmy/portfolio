"use client";
import { useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useMe, useRemoveAvatar, useUpdateMe, useUploadAvatar, type Me } from "@/hooks/useAdmins";
import { Avatar, Labeled, Meter, Notice, PasswordInput, Section, btn, card, explain, fieldError, type Msg } from "./ui";

type Locale = "ar" | "en";

const COPY = {
  ar: {
    photo: "صورتك", change: "غيّر الصورة", remove: "امسح الصورة", uploading: "بيترفع…", imgHint: "JPG / PNG / WebP لحد 4MB", imgBad: "الصورة لازم تكون JPG أو PNG أو WebP وأصغر من 4MB", imgFail: "الرفع فشل، حاول تاني",
    profile: "بياناتك", name: "الاسم", email: "الإيميل", saveChanges: "احفظ التعديلات", saving: "بيتحفظ…", saved: "اتحفظت البيانات",
    needPw: "غيّرت الإيميل، اكتب الباسورد الحالي عشان تأكد", security: "الأمان", current: "الباسورد الحالي", next: "الباسورد الجديد", again: "أكّد الباسورد الجديد",
    changePw: "غيّر الباسورد", pwSaved: "الباسورد اتغيّر، وباقي الأجهزة اتسجّل خروجها", mismatch: "الباسورد الجديد والتأكيد مش زي بعض", show: "اظهر", hide: "اخفي",
    wrong: "الباسورد الحالي غلط", locked: "محاولات كتير، استنى 15 دقيقة", taken: "الإيميل ده مستخدم قبل كده", failed: "حصلت مشكلة، حاول تاني", tip: "12 حرف على الأقل. حروف كبيرة وصغيرة وأرقام ورموز تقوّيه.",
  },
  en: {
    photo: "Your photo", change: "Change photo", remove: "Remove photo", uploading: "Uploading…", imgHint: "JPG / PNG / WebP up to 4MB", imgBad: "Image must be JPG, PNG or WebP under 4MB", imgFail: "Upload failed, try again",
    profile: "Your details", name: "Name", email: "Email", saveChanges: "Save changes", saving: "Saving…", saved: "Details saved",
    needPw: "You changed the email, enter your current password to confirm", security: "Security", current: "Current password", next: "New password", again: "Confirm new password",
    changePw: "Change password", pwSaved: "Password changed, other devices were signed out", mismatch: "New password and confirmation don't match", show: "Show", hide: "Hide",
    wrong: "Current password is wrong", locked: "Too many attempts, wait 15 minutes", taken: "That email is already in use", failed: "Something went wrong, try again", tip: "At least 12 characters. Mixed case, digits and symbols make it stronger.",
  },
};
type Copy = (typeof COPY)["ar"];

export function AccountPanel({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const me = useMe();
  if (!me.data) return <div className="mt-5 h-64 animate-pulse rounded-3xl bg-sand" />;
  return (
    <section className="mt-5 grid items-start gap-5 lg:grid-cols-[20rem_1fr]">
      <PhotoCard me={me.data} c={c} />
      <div className="space-y-5">
        <Section n="1" title={c.profile}><ProfileForm me={me.data} c={c} /></Section>
        <Section n="2" title={c.security}><PasswordForm c={c} /></Section>
      </div>
    </section>
  );
}

function PhotoCard({ me, c }: { me: Me; c: Copy }) {
  const upload = useUploadAvatar();
  const remove = useRemoveAvatar();
  const input = useRef<HTMLInputElement>(null);
  const [err, setErr] = useState("");
  const [over, setOver] = useState(false);
  const busy = upload.isPending || remove.isPending;

  const pick = (file?: File) => {
    if (!file || busy) return;
    setErr("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 4 * 1024 * 1024) return setErr(c.imgBad);
    upload.mutate(file, { onError: () => setErr(c.imgFail) });
  };

  return (
    <div className={`${card} text-center lg:sticky lg:top-6`}>
      <p className="mb-4 text-start text-sm font-semibold text-ink/70">{c.photo}</p>
      <div
        onDragOver={(e) => { e.preventDefault(); setOver(true); }}
        onDragLeave={() => setOver(false)}
        onDrop={(e) => { e.preventDefault(); setOver(false); pick(e.dataTransfer.files[0]); }}
        className={`group relative mx-auto w-fit rounded-full p-2 transition ${over ? "bg-terra/15 ring-2 ring-terra" : ""}`}
      >
        <Avatar url={me.avatarUrl} name={me.name || me.email} size={160} />
        <button
          type="button" disabled={busy} onClick={() => input.current?.click()} aria-label={c.change}
          className="absolute inset-2 grid place-items-center rounded-full bg-ink/60 text-sm font-semibold text-cream opacity-0 transition focus-visible:opacity-100 group-hover:opacity-100"
        >
          {upload.isPending ? c.uploading : c.change}
        </button>
        <input ref={input} type="file" accept="image/jpeg,image/png,image/webp" hidden onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} />
      </div>
      <div aria-hidden className="squiggle mx-auto mt-4 w-16" />
      <p className="mt-3 text-xs text-ink/60">{c.imgHint}</p>
      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <button type="button" disabled={busy} onClick={() => input.current?.click()} className={`${btn} bg-ink text-cream`}>{upload.isPending ? c.uploading : c.change}</button>
        {me.avatarUrl && <button type="button" disabled={busy} onClick={() => remove.mutate()} className={`${btn} border border-terra text-terra`}>{c.remove}</button>}
      </div>
      {err && <p role="alert" className="mt-3 text-sm text-terra">{err}</p>}
    </div>
  );
}

function ProfileForm({ me, c }: { me: Me; c: Copy }) {
  const v = useTranslations("Validation");
  const update = useUpdateMe();
  const [name, setName] = useState(me.name);
  const [email, setEmail] = useState(me.email);
  const [pw, setPw] = useState("");
  const [msg, setMsg] = useState<Msg>(null);

  const emailChanged = email.trim().toLowerCase() !== me.email;
  const dirty = name.trim() !== me.name || emailChanged;
  const fe = (k: string) => { const m = fieldError(update.error, k); return m ? v(m) : undefined; };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    update.mutate(
      { name: name.trim(), email: email.trim(), ...(emailChanged ? { currentPassword: pw } : {}) },
      {
        onSuccess: () => { setPw(""); setMsg({ ok: true, text: c.saved }); },
        onError: (x) => setMsg({ ok: false, text: explain(x, c) }),
      },
    );
  };

  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2">
        <Labeled label={c.name} error={fe("name")}><input className="input" maxLength={80} value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></Labeled>
        <Labeled label={c.email} error={fe("email")}><input dir="ltr" type="email" className="input" value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="username" /></Labeled>
      </div>
      {emailChanged && (
        <div className="rise rounded-2xl border-2 border-dashed border-ink/20 p-4">
          <Labeled label={c.current} error={fe("currentPassword")} hint={c.needPw}>
            <PasswordInput showLabel={c.show} hideLabel={c.hide} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          </Labeled>
        </div>
      )}
      <Notice msg={msg} />
      <button disabled={!dirty || update.isPending || (emailChanged && !pw)} className={`${btn} bg-ink text-cream`}>{update.isPending ? c.saving : c.saveChanges}</button>
    </form>
  );
}

function PasswordForm({ c }: { c: Copy }) {
  const v = useTranslations("Validation");
  const update = useUpdateMe();
  const [cur, setCur] = useState("");
  const [next, setNext] = useState("");
  const [again, setAgain] = useState("");
  const [msg, setMsg] = useState<Msg>(null);
  const fe = (k: string) => { const m = fieldError(update.error, k); return m ? v(m) : undefined; };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    if (next !== again) return setMsg({ ok: false, text: c.mismatch });
    update.mutate(
      { newPassword: next, currentPassword: cur },
      {
        onSuccess: () => { setCur(""); setNext(""); setAgain(""); setMsg({ ok: true, text: c.pwSaved }); },
        onError: (x) => setMsg({ ok: false, text: explain(x, c) }),
      },
    );
  };

  const pw = { showLabel: c.show, hideLabel: c.hide };
  return (
    <form onSubmit={submit} noValidate className="space-y-4">
      <Labeled label={c.current}><PasswordInput {...pw} value={cur} onChange={(e) => setCur(e.target.value)} autoComplete="current-password" /></Labeled>
      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Labeled label={c.next} error={fe("newPassword")}><PasswordInput {...pw} value={next} onChange={(e) => setNext(e.target.value)} autoComplete="new-password" maxLength={128} /></Labeled>
          <Meter value={next} />
        </div>
        <Labeled label={c.again}><PasswordInput {...pw} value={again} onChange={(e) => setAgain(e.target.value)} autoComplete="new-password" maxLength={128} /></Labeled>
      </div>
      <p className="text-xs text-ink/60">{c.tip}</p>
      <Notice msg={msg} />
      <button disabled={update.isPending || !cur || !next || !again} className={`${btn} bg-terra text-cream`}>{update.isPending ? c.saving : c.changePw}</button>
    </form>
  );
}