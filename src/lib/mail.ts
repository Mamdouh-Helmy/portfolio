// src/lib/mail.ts — سيرفر بس، ماتعملوش import في أي ملف "use client"
import nodemailer from "nodemailer";
import { PORTRAIT_BASE64 } from "./mail-portrait";
import { isArabic, notificationHtml, replyHtml } from "./mail-template";

function mailer() {
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!user || !pass) throw new Error("SMTP_USER / SMTP_PASS are missing");
  return { user, transport: nodemailer.createTransport({ service: "gmail", auth: { user, pass } }) };
}

// الصورة مرفقة جوه الإيميل (cid) فبتظهر حتى وانت شغال على localhost
const attachments = [{ filename: "portrait.jpg", content: Buffer.from(PORTRAIT_BASE64, "base64"), cid: "portrait", contentType: "image/jpeg" }];

type Contact = { name: string; email: string; message: string };

/** إشعار ليك برسالة جديدة. لو دوست Reply في Gmail هيرد على الزائر */
export async function notifyNewMessage({ name, email, message }: Contact) {
  const { user, transport } = mailer();
  const site = process.env.SITE_URL?.replace(/\/$/, "");
  await transport.sendMail({
    from: { name: "Portfolio", address: user },
    to: process.env.CONTACT_TO || user,
    replyTo: { name, address: email },
    subject: `رسالة جديدة من ${name}`,
    text: `الاسم: ${name}\nالإيميل: ${email}\n\n${message}`,
    html: notificationHtml({ name, email, message, dashboardUrl: site && `${site}/ar/admin` }),
    attachments,
  });
}

/** ردك على الزائر من الـ Dashboard */
export async function sendReply(to: Contact, body: string) {
  const { user, transport } = mailer();
  const quoted = to.message.split("\n").map((l) => `> ${l}`).join("\n");
  await transport.sendMail({
    from: { name: "Mamdouh", address: user },
    to: { name: to.name, address: to.email },
    subject: isArabic(to.message) ? "رد على رسالتك" : "Re: your message",
    text: `${body}\n\n---\n${quoted}`,
    html: replyHtml({ name: to.name, message: to.message, body }),
    attachments,
  });
}