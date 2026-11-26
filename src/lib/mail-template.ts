// قوالب الإيميل: جداول و inline styles عشان تشتغل في Gmail و Outlook
const esc = (s: string) => s.replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const lines = (s: string) => esc(s).replace(/\r?\n/g, "<br>");

export const isArabic = (s: string) => /[؀-ۿ]/.test(s);

const FONT = "'Segoe UI',Tahoma,Arial,sans-serif";

function layout({ rtl, preview, title, eyebrow, content, footer }: { rtl: boolean; preview: string; title: string; eyebrow: string; content: string; footer: string }) {
  const dir = rtl ? "rtl" : "ltr";
  const align = rtl ? "right" : "left";
  return `<!doctype html>
<html lang="${rtl ? "ar" : "en"}" dir="${dir}">
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="color-scheme" content="light"></head>
<body style="margin:0;padding:0;">
<div style="display:none;max-height:0;overflow:hidden;">${esc(preview)}</div>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td align="center" style="padding:32px 12px;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" dir="${dir}" style="max-width:560px;font-family:${FONT};color:#2B1E16;text-align:${align};">
    <tr><td align="center" bgcolor="#2B1E16" style="padding:32px 24px 28px;border-radius:24px 24px 0 0;">
      <img src="cid:portrait" width="96" height="96" alt="Mamdouh" style="display:block;margin:0 auto 16px;border-radius:50%;border:4px solid #FAF5EC;">
      <div style="color:#E9D8BF;font-size:13px;text-align:center;">${esc(eyebrow)}</div>
      <div style="color:#FAF5EC;font-size:26px;font-weight:bold;line-height:1.4;text-align:center;">${esc(title)}</div>
    </td></tr>
    <tr><td height="6" bgcolor="#C8553D" style="font-size:0;line-height:0;">&nbsp;</td></tr>
    <tr><td bgcolor="#FFFDF9" style="padding:28px 28px 32px;font-size:15px;line-height:1.8;text-align:${align};">${content}</td></tr>
    <tr><td align="center" bgcolor="#E9D8BF" style="padding:18px 24px;border-radius:0 0 24px 24px;border-top:2px dashed #FAF5EC;font-size:12px;text-align:center;">${esc(footer)}</td></tr>
  </table>
</td></tr></table>
</body></html>`;
}

const quote = (text: string) =>
  `<table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td dir="auto" bgcolor="#F3E9D8" style="padding:16px 18px;border-radius:14px;word-break:break-word;">${lines(text)}</td></tr></table>`;

const button = (href: string, label: string, bg: string) =>
  `<a href="${esc(href)}" style="display:inline-block;margin:4px;padding:12px 28px;border-radius:999px;background:${bg};color:#FAF5EC;font-weight:bold;font-size:14px;text-decoration:none;">${esc(label)}</a>`;

/** الإشعار اللي بيوصلك */
export function notificationHtml({ name, email, message, dashboardUrl }: { name: string; email: string; message: string; dashboardUrl?: string }) {
  return layout({
    rtl: true,
    preview: message.slice(0, 90),
    eyebrow: "رسالة جديدة من الموقع",
    title: name,
    content: `
      <p style="margin:0 0 4px;font-size:12px;color:#8A7668;">الإيميل</p>
      <p style="margin:0 0 20px;"><span dir="ltr" style="color:#C8553D;font-weight:bold;">${esc(email)}</span></p>
      ${quote(message)}
      <div style="margin-top:24px;text-align:center;">
        ${button(`mailto:${encodeURIComponent(email).replace("%40", "@")}`, "رد عليه", "#C8553D")}
        ${dashboardUrl ? button(dashboardUrl, "افتح لوحة التحكم", "#2B1E16") : ""}
      </div>`,
    footer: "اتبعتت من فورم التواصل في موقعك",
  });
}

/** ردك اللي بيوصل للزائر */
export function replyHtml({ name, message, body }: { name: string; message: string; body: string }) {
  const rtl = isArabic(body);
  return layout({
    rtl,
    preview: body.slice(0, 90),
    eyebrow: rtl ? "رد على رسالتك" : "A reply to your message",
    title: rtl ? `أهلًا ${name}` : `Hi ${name}`,
    content: `
      <div dir="auto">${lines(body)}</div>
      <p style="margin:28px 0 24px;font-weight:bold;">${rtl ? "تحياتي،<br>ممدوح" : "Best,<br>Mamdouh"}</p>
      <p style="margin:0 0 8px;font-size:12px;color:#8A7668;">${rtl ? "رسالتك" : "Your message"}</p>
      ${quote(message)}`,
    footer: rtl ? "تقدر ترد على الإيميل ده مباشرة" : "You can reply to this email directly",
  });
}