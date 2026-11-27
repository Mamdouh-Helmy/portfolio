"use client";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";
import { useAdmins, useCreateAdmin, useDeleteAdmin, useMe, type Member } from "@/hooks/useAdmins";
import { Avatar, Labeled, Meter, Notice, PasswordInput, btn, card, explain, fieldError, type Msg } from "./ui";

type Locale = "ar" | "en";

const COPY = {
  ar: {
    title: "فريق الإدارة", add: "ضيف أدمن", close: "اقفل", you: "أنت", never: "لسه ماسجّلش دخول", last: "آخر دخول", joined: "اتضاف",
    name: "الاسم", email: "الإيميل", password: "باسورد مؤقت", generate: "ولّد باسورد", yourPw: "باسورد حضرتك (للتأكيد)", yourPwHint: "مطلوب عشان تضيف أو تمسح أدمن",
    create: "أنشئ الأدمن", creating: "بيتضاف…", created: "الأدمن اتضاف. ابعتله الباسورد بشكل آمن وخليه يغيّره من حسابه.",
    delete: "امسح", confirmTitle: "مسح أدمن", confirmNote: "هيتسجّل خروجه فورًا ومش هتقدر ترجّعه.", cancel: "إلغاء",
    wrong: "الباسورد غلط", locked: "محاولات كتير، استنى 15 دقيقة", taken: "الإيميل ده مستخدم قبل كده", failed: "حصلت مشكلة، حاول تاني",
    loadError: "ماعرفتش أحمّل القائمة", retry: "حاول تاني", show: "اظهر", hide: "اخفي", copy: "انسخ", copied: "اتنسخ",
  },
  en: {
    title: "Admin team", add: "Add admin", close: "Close", you: "You", never: "Never signed in", last: "Last login", joined: "Added",
    name: "Name", email: "Email", password: "Temporary password", generate: "Generate", yourPw: "Your password (to confirm)", yourPwHint: "Required to add or remove an admin",
    create: "Create admin", creating: "Adding…", created: "Admin added. Share the password securely and ask them to change it from their account.",
    delete: "Delete", confirmTitle: "Delete admin", confirmNote: "They'll be signed out immediately. This can't be undone.", cancel: "Cancel",
    wrong: "Wrong password", locked: "Too many attempts, wait 15 minutes", taken: "That email is already in use", failed: "Something went wrong, try again",
    loadError: "Couldn't load the list", retry: "Retry", show: "Show", hide: "Hide", copy: "Copy", copied: "Copied",
  },
};
type Copy = (typeof COPY)["ar"];

const generate = () => {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%&*?";
  const buf = crypto.getRandomValues(new Uint32Array(18));
  return Array.from(buf, (n) => chars[n % chars.length]).join("");
};

export function TeamPanel({ locale }: { locale: Locale }) {
  const c = COPY[locale];
  const me = useMe();
  const admins = useAdmins();
  const [open, setOpen] = useState(false);
  const [target, setTarget] = useState<Member | null>(null);
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" });

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="font-display text-3xl">{c.title} <span className="text-terra">{(admins.data?.length ?? 0).toLocaleString(locale === "ar" ? "ar-EG" : "en")}</span></h2>
        <button onClick={() => setOpen((o) => !o)} aria-expanded={open} className={`${btn} ${open ? "border border-ink" : "bg-terra text-cream"}`}>{open ? c.close : `+ ${c.add}`}</button>
      </div>

      {open && <AddForm c={c} />}

      {admins.isPending && <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-40 animate-pulse rounded-3xl bg-sand" />)}</div>}
      {admins.isError && (
        <div role="alert" className={`${card} mt-5 text-center`}><p>{c.loadError}</p><button onClick={() => admins.refetch()} className={`${btn} mt-3 bg-ink text-cream`}>{c.retry}</button></div>
      )}

      <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {admins.data?.map((a, i) => {
          const mine = a.id === me.data?.id;
          return (
            <li key={a.id} className={`${card} rise relative flex flex-col items-center text-center`} style={{ animationDelay: `${i * 70}ms` }}>
              {mine && <span className="absolute end-4 top-4 rounded-full bg-terra px-3 py-0.5 text-xs font-bold text-cream">{c.you}</span>}
              <Avatar url={a.avatarUrl} name={a.name || a.email} size={88} />
              <h3 className="font-display mt-3 text-2xl"><bdi>{a.name || a.email.split("@")[0]}</bdi></h3>
              <p dir="ltr" className="max-w-full truncate text-sm text-terra">{a.email}</p>
              <div aria-hidden className="squiggle my-3 w-14" />
              <p className="text-xs text-ink/60">{a.lastLoginAt ? `${c.last}: ${date.format(new Date(a.lastLoginAt))}` : c.never}</p>
              <p className="text-xs text-ink/45">{c.joined}: {date.format(new Date(a.createdAt))}</p>
              {!mine && <button onClick={() => setTarget(a)} className={`${btn} mt-4 w-full border border-terra text-terra`}>{c.delete}</button>}
            </li>
          );
        })}
      </ul>

      {target && <DeleteDialog c={c} member={target} onClose={() => setTarget(null)} />}
    </section>
  );
}

function AddForm({ c }: { c: Copy }) {
  const v = useTranslations("Validation");
  const create = useCreateAdmin();
  const [f, setF] = useState({ name: "", email: "", password: "", currentPassword: "" });
  const [msg, setMsg] = useState<Msg>(null);
  const [copied, setCopied] = useState(false);
  const set = (k: keyof typeof f) => (e: { target: { value: string } }) => setF((x) => ({ ...x, [k]: e.target.value }));
  const fe = (k: string) => { const m = fieldError(create.error, k); return m ? v(m) : undefined; };

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setMsg(null);
    create.mutate(f, {
      onSuccess: () => { setF({ name: "", email: "", password: "", currentPassword: "" }); setMsg({ ok: true, text: c.created }); },
      onError: (x) => setMsg({ ok: false, text: explain(x, c) }),
    });
  };

  const pw = { showLabel: c.show, hideLabel: c.hide };
  return (
    <form onSubmit={submit} noValidate className={`${card} rise mt-5 space-y-4`}>
      <div className="grid gap-4 md:grid-cols-2">
        <Labeled label={c.name} error={fe("name")}><input className="input" maxLength={80} value={f.name} onChange={set("name")} autoComplete="off" /></Labeled>
        <Labeled label={c.email} error={fe("email")}><input dir="ltr" type="email" className="input" value={f.email} onChange={set("email")} autoComplete="off" /></Labeled>
        <div>
          <Labeled label={c.password} error={fe("password")}>
            <PasswordInput {...pw} value={f.password} onChange={set("password")} autoComplete="new-password" maxLength={128} />
          </Labeled>
          <Meter value={f.password} />
          <div className="mt-2 flex gap-2">
            <button type="button" onClick={() => setF((x) => ({ ...x, password: generate() }))} className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{c.generate}</button>
            {f.password && <button type="button" onClick={() => navigator.clipboard?.writeText(f.password).then(() => { setCopied(true); setTimeout(() => setCopied(false), 1500); })} className="rounded-full bg-sand px-3 py-1 text-xs font-semibold">{copied ? c.copied : c.copy}</button>}
          </div>
        </div>
        <Labeled label={c.yourPw} hint={c.yourPwHint} error={fe("currentPassword")}>
          <PasswordInput {...pw} value={f.currentPassword} onChange={set("currentPassword")} autoComplete="current-password" />
        </Labeled>
      </div>
      <Notice msg={msg} />
      <button disabled={create.isPending || !f.name || !f.email || !f.password || !f.currentPassword} className={`${btn} bg-ink text-cream`}>{create.isPending ? c.creating : c.create}</button>
    </form>
  );
}

function DeleteDialog({ c, member, onClose }: { c: Copy; member: Member; onClose: () => void }) {
  const ref = useRef<HTMLDialogElement>(null);
  const del = useDeleteAdmin();
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  useEffect(() => { if (!ref.current?.open) ref.current?.showModal(); }, []);

  const submit = (e: FormEvent) => {
    e.preventDefault();
    setErr("");
    del.mutate({ id: member.id, currentPassword: pw }, { onSuccess: onClose, onError: (x) => setErr(explain(x, c)) });
  };

  return (
    <dialog ref={ref} onClose={onClose} data-lenis-prevent className="modal-pop-in m-auto w-[min(92vw,26rem)] rounded-3xl bg-cream p-6 text-ink backdrop:bg-ink/60">
      <form onSubmit={submit}>
        <h2 className="font-display text-2xl">{c.confirmTitle}</h2>
        <div className="mt-3 flex items-center gap-3">
          <Avatar url={member.avatarUrl} name={member.name || member.email} size={44} />
          <div className="min-w-0">
            <p className="font-semibold"><bdi>{member.name || member.email.split("@")[0]}</bdi></p>
            <p dir="ltr" className="truncate text-sm text-terra">{member.email}</p>
          </div>
        </div>
        <p className="mt-3 text-sm text-ink/65">{c.confirmNote}</p>
        <div className="mt-4">
          <Labeled label={c.yourPw}>
            <PasswordInput autoFocus showLabel={c.show} hideLabel={c.hide} value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="current-password" />
          </Labeled>
        </div>
        {err && <p role="alert" className="mt-2 text-sm text-terra">{err}</p>}
        <div className="mt-5 flex gap-2">
          <button type="button" onClick={onClose} className={`${btn} flex-1 border border-ink`}>{c.cancel}</button>
          <button disabled={!pw || del.isPending} className={`${btn} flex-1 bg-terra text-cream`}>{c.delete}</button>
        </div>
      </form>
    </dialog>
  );
}