"use client";
// src/components/admin/ReplyBox.tsx
import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { ApiError, api } from "@/lib/fetcher";

const COPY = {
  ar: { reply: "رد", again: "رد تاني", ph: "اكتب ردك…", send: "ابعت الرد", sending: "بيتبعت…", cancel: "إلغاء", sent: "الرد اتبعت", replied: "اترد عليه", failed: "الإرسال فشل، حاول تاني", tooMany: "بعت ردود كتير، استنى شوية" },
  en: { reply: "Reply", again: "Reply again", ph: "Write your reply…", send: "Send reply", sending: "Sending…", cancel: "Cancel", sent: "Reply sent", replied: "Replied", failed: "Sending failed, try again", tooMany: "Too many replies, wait a bit" },
};

const btn = "rounded-full px-5 py-2.5 text-sm font-semibold disabled:opacity-60";

type Props = { id: string; locale: "ar" | "en"; repliedAt?: string | Date | null; onSent: () => void };

export function ReplyBox({ id, locale, repliedAt, onSent }: Props) {
  const c = COPY[locale];
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [body, setBody] = useState("");
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState("");

  const send = async () => {
    setState("sending");
    setError("");
    try {
      await api("/api/admin/contact/reply", { method: "POST", body: JSON.stringify({ id, body }) });
      setState("sent");
      setBody("");
      setOpen(false);
      onSent();
    } catch (e) {
      setState("idle");
      const status = e instanceof ApiError ? e.status : 0;
      if (status === 401 || status === 403) return router.replace("/admin/login");
      setError(status === 429 ? c.tooMany : c.failed);
    }
  };

  if (!open)
    return (
      <>
        <button onClick={() => { setOpen(true); setState("idle"); }} className={`${btn} bg-ink text-cream`}>{repliedAt ? c.again : c.reply}</button>
        {(state === "sent" || repliedAt) && <span role="status" className="self-center text-xs font-semibold text-terra">✓ {state === "sent" ? c.sent : c.replied}</span>}
      </>
    );

  return (
    <div className="basis-full space-y-2">
      <textarea autoFocus rows={4} maxLength={5000} dir="auto" aria-label={c.ph} placeholder={c.ph} value={body} onChange={(e) => setBody(e.target.value)} className="input" data-lenis-prevent />
      {error && <p role="alert" className="text-sm text-terra">{error}</p>}
      <div className="flex gap-2">
        <button onClick={send} disabled={state === "sending" || body.trim().length < 2} className={`${btn} bg-terra text-cream`}>{state === "sending" ? c.sending : c.send}</button>
        <button onClick={() => setOpen(false)} disabled={state === "sending"} className={`${btn} border border-ink`}>{c.cancel}</button>
      </div>
    </div>
  );
}