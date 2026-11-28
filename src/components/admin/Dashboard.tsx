"use client";
import Image from "next/image";
import { useEffect, useRef, useState, type ComponentProps, type ReactNode } from "react";
import { useTranslations } from "next-intl";
import { AccountPanel } from "@/components/admin/AccountPanel";
import { ReplyBox } from "@/components/admin/ReplyBox";
import { TeamPanel } from "@/components/admin/TeamPanel";
import { Avatar, Labeled, Section, btn, card } from "@/components/admin/ui";
import { useMe } from "@/hooks/useAdmins";
import { useLogout } from "@/hooks/useAuth";
import { uploadVideo, useDeleteMessage, useMessages, useProjectMutations, useProjects } from "@/hooks/useProjects";
import { Link, useRouter } from "@/i18n/navigation";
import { useLanguage } from "@/context/LanguageContext";
import { projectSchema, fieldErrors, type FieldErrors } from "@/lib/validation";
import { ApiError } from "@/lib/fetcher";
import type { ProjectDoc } from "@/models/Project";

const COPY = {
  ar: {
    welcome: "أهلًا بيك يا", site: "عرض الموقع", total: "المشاريع", featured: "المميزة", inbox: "الرسايل", week: "آخر ٧ أيام",
    account: "حسابي", team: "الأدمنز",
    search: "دوّر…", all: "الكل", noResults: "مفيش نتايج", noProjects: "لسه مفيش مشاريع، ضيف أول واحد", loadError: "ماعرفتش أحمّل البيانات", retry: "حاول تاني",
    deleteNote: "مش هتقدر ترجّعه بعد المسح.", cancel: "إلغاء", basics: "الأساسيات", details: "التفاصيل", media: "الصورة والفيديو", numbers: "أرقام الإنجاز", preview: "معاينة",
    addMetric: "ضيف رقم", value: "القيمة", labelAr: "الوصف بالعربي", labelEn: "الوصف بالإنجليزي", removeRow: "شيل", metricError: "كمّل الخانات التلاتة أو امسح الصف",
    drop: "اسحب الصورة هنا أو اضغط للاختيار", limits: "JPG / PNG / WebP لحد 5MB", badFile: "الملف لازم يكون JPG أو PNG أو WebP وأصغر من 5MB", uploadFailed: "الرفع فشل، حاول تاني",
    video: "فيديو (اختياري)", dropVideo: "اسحب الفيديو هنا أو اضغط للاختيار", videoLimits: "MP4 / WebM لحد 50MB، بيشتغل من غير صوت", badVideo: "الفيديو لازم يكون MP4 أو WebM وأصغر من 50MB", videoFailed: "رفع الفيديو فشل، حاول تاني", removeVideo: "شيل الفيديو",
    discard: "فيه تعديلات ماتحفظتش، تخرج؟", check: "راجع الحقول دي", tagsHint: "افصل بينهم بفاصلة", reply: "رد", copy: "انسخ الإيميل", copied: "اتنسخ", deleteFailed: "المسح فشل", untitled: "عنوان المشروع",
  },
  en: {
    welcome: "Welcome back,", site: "View site", total: "Projects", featured: "Featured", inbox: "Messages", week: "Last 7 days",
    account: "My account", team: "Admins",
    search: "Search…", all: "All", noResults: "No results", noProjects: "No projects yet, add your first", loadError: "Couldn't load data", retry: "Retry",
    deleteNote: "This can't be undone.", cancel: "Cancel", basics: "Basics", details: "Details", media: "Image & video", numbers: "Key numbers", preview: "Preview",
    addMetric: "Add number", value: "Value", labelAr: "Arabic label", labelEn: "English label", removeRow: "Remove", metricError: "Fill all three or remove the row",
    drop: "Drop an image here or click to choose", limits: "JPG / PNG / WebP up to 5MB", badFile: "File must be JPG, PNG or WebP under 5MB", uploadFailed: "Upload failed, try again",
    video: "Video (optional)", dropVideo: "Drop a video here or click to choose", videoLimits: "MP4 / WebM up to 50MB, plays muted", badVideo: "Video must be MP4 or WebM under 50MB", videoFailed: "Video upload failed, try again", removeVideo: "Remove video",
    discard: "You have unsaved changes. Leave?", check: "Check these fields", tagsHint: "Separate with commas", reply: "Reply", copy: "Copy email", copied: "Copied", deleteFailed: "Delete failed", untitled: "Project title",
  },
};

type Locale = "ar" | "en";
type Metric = { value: string; ar: string; en: string };
type Draft = { id?: string; title: Record<Locale, string>; description: Record<Locale, string>; tags: string; imageUrl: string; imagePublicId: string; videoUrl: string; videoPublicId: string; link: string; repo: string; featured: boolean; order: number; category: string; year: string; metrics: Metric[] };
const blank = { ar: "", en: "" };
const empty: Draft = { title: blank, description: blank, tags: "", imageUrl: "", imagePublicId: "", videoUrl: "", videoPublicId: "", link: "", repo: "", featured: false, order: 0, category: "", year: "", metrics: [] };

const toDraft = (p: ProjectDoc): Draft => ({
  id: String(p._id), title: p.title, description: p.description, tags: p.tags.join(", "), imageUrl: p.imageUrl, imagePublicId: p.imagePublicId,
  videoUrl: p.videoUrl ?? "", videoPublicId: p.videoPublicId ?? "",
  link: p.link ?? "", repo: p.repo ?? "", featured: !!p.featured, order: p.order ?? 0, category: p.category ?? "", year: p.year ?? "",
  metrics: (p.metrics ?? []).map((m) => ({ value: m.value ?? "", ar: m.ar ?? "", en: m.en ?? "" })),
});
const splitTags = (s: string) => s.split(/[,،]/).map((x) => x.trim()).filter(Boolean);

type Tab = "projects" | "messages" | "account" | "team";

function useSessionGuard(error: unknown) {
  const router = useRouter();
  useEffect(() => {
    if (error instanceof ApiError && error.status === 401) router.replace("/admin/login");
  }, [error, router]);
}

export function Dashboard() {
  const t = useTranslations("Admin");
  const { locale } = useLanguage();
  const c = COPY[locale];
  const router = useRouter();
  const logout = useLogout();
  const me = useMe();
  const projects = useProjects();
  const messages = useMessages();
  const [tab, setTab] = useState<Tab>("projects");
  const [draft, setDraft] = useState<Draft | null>(null);
  const [now] = useState(() => Date.now());
  useSessionGuard(messages.error ?? me.error);

  const list = projects.data ?? [];
  const inbox = messages.data ?? [];
  const who = me.data?.name || me.data?.email.split("@")[0] || "";
  const stats = [
    { label: c.total, n: list.length },
    { label: c.featured, n: list.filter((p) => p.featured).length },
    { label: c.inbox, n: inbox.length },
    { label: c.week, n: inbox.filter((m) => now - new Date(m.createdAt).getTime() < 7 * 864e5).length },
  ];

  return (
    <main className="dots min-h-dvh pb-16">
      <header className="weave bg-ink pb-24 pt-8 text-cream">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-5">
          <div className="rise flex items-center gap-4">
            <Avatar url={me.data?.avatarUrl} name={who} size={64} ring />
            <div className="flex flex-col gap-3">
              <p className="font-note text-lg leading-none text-sand">{c.welcome} <bdi>{who}</bdi></p>
              <h1 className="font-display text-4xl leading-[1.6]">{t("dashboard")}</h1>
            </div>
          </div>
          <div className="flex gap-2">
            <Link href="/" className={`${btn} border border-cream/40`}>{c.site}</Link>
            <button disabled={logout.isPending} onClick={() => logout.mutate(undefined, { onSuccess: () => router.replace("/admin/login") })} className={`${btn} bg-terra text-cream`}>{t("logout")}</button>
          </div>
        </div>
      </header>

      <div className="mx-auto -mt-16 max-w-6xl px-5">
        <ul className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {stats.map((s, i) => (
            <li key={s.label} className={`${card} rise`} style={{ animationDelay: `${i * 80}ms` }}>
              <p className="text-sm text-ink/65">{s.label}</p>
              <p className="font-display mt-1 text-5xl text-terra">{s.n.toLocaleString(locale === "ar" ? "ar-EG" : "en")}</p>
              <div aria-hidden className="squiggle mt-2 w-16" />
            </li>
          ))}
        </ul>

        <div className="mt-8 inline-flex max-w-full gap-1 overflow-x-auto rounded-full bg-sand p-1" role="tablist">
          {(["projects", "messages", "account", "team"] as const).map((k) => (
            <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)} className={`shrink-0 rounded-full px-5 py-2 text-sm font-semibold transition ${tab === k ? "bg-ink text-cream" : "hover:bg-cream"}`}>
              {k === "projects" ? t("tabProjects") : k === "messages" ? t("tabMessages") : c[k]}
              {(k === "projects" || k === "messages") && (
                <span className="ms-2 rounded-full bg-terra px-2 text-xs text-cream">{k === "projects" ? list.length : inbox.length}</span>
              )}
            </button>
          ))}
        </div>

        <div hidden={tab !== "projects"}>
          {draft ? <ProjectForm key={draft.id ?? "new"} draft={draft} locale={locale} onDone={() => setDraft(null)} /> : <ProjectList query={projects} locale={locale} onEdit={setDraft} />}
        </div>
        {tab === "messages" && <Messages query={messages} locale={locale} />}
        {tab === "account" && <AccountPanel locale={locale} />}
        {tab === "team" && <TeamPanel locale={locale} />}
      </div>
    </main>
  );
}

function ProjectList({ query, locale, onEdit }: { query: ReturnType<typeof useProjects>; locale: Locale; onEdit: (d: Draft) => void }) {
  const t = useTranslations("Admin");
  const c = COPY[locale];
  const { remove } = useProjectMutations();
  const [q, setQ] = useState("");
  const [onlyFeatured, setOnlyFeatured] = useState(false);
  const [target, setTarget] = useState<ProjectDoc | null>(null);
  useSessionGuard(remove.error);

  const items = (query.data ?? []).filter((p) =>
    (!onlyFeatured || p.featured) &&
    [p.title.ar, p.title.en, p.category, ...p.tags].join(" ").toLowerCase().includes(q.trim().toLowerCase()));

  return (
    <section className="mt-5">
      <div className="flex flex-wrap items-center gap-3">
        <input type="search" aria-label={c.search} placeholder={c.search} value={q} onChange={(e) => setQ(e.target.value)} className="input w-auto! min-w-0 flex-1" />
        <button aria-pressed={onlyFeatured} onClick={() => setOnlyFeatured((x) => !x)} className={`${btn} ${onlyFeatured ? "bg-ink text-cream" : "bg-sand"}`}>★ {c.featured}</button>
        <button onClick={() => onEdit(empty)} className={`${btn} bg-terra text-cream`}>+ {t("newProject")}</button>
      </div>
      {remove.isError && <p role="alert" className="mt-3 text-sm text-terra">{c.deleteFailed}</p>}

      <State query={query} locale={locale} count={items.length} emptyText={query.data?.length ? c.noResults : c.noProjects}>
        <ul className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((p) => (
            <li key={String(p._id)} className={`${card} group flex flex-col overflow-hidden p-0!`}>
              <div className="relative aspect-video overflow-hidden bg-sand">
                <Image src={p.imageUrl} alt="" fill sizes="(min-width:1024px) 33vw, 100vw" className="object-contain transition duration-500 group-hover:scale-105" />
                {p.featured && <span className="absolute start-3 top-3 rounded-full bg-terra px-3 py-1 text-xs font-bold text-cream">★ {c.featured}</span>}
                <span className="absolute end-3 top-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-cream">#{p.order ?? 0}</span>
                {p.videoUrl && <span className="absolute bottom-3 end-3 rounded-full bg-ink/80 px-2.5 py-1 text-xs text-cream">🎬</span>}
              </div>
              <div className="flex flex-1 flex-col p-4">
                <p className="text-xs text-ink/60">{[p.category, p.year].filter(Boolean).join(" · ")}</p>
                <h3 className="font-display mt-1 text-2xl">{p.title[locale]}</h3>
                <p className="mt-1 line-clamp-2 text-sm text-ink/70">{p.description[locale]}</p>
                <ul className="mt-3 flex flex-wrap gap-1.5">{p.tags.slice(0, 5).map((tag) => <li key={tag} dir="ltr" className="rounded-full bg-sand px-2.5 py-0.5 text-xs">{tag}</li>)}</ul>
                <div className="mt-auto flex gap-2 pt-4">
                  <button onClick={() => onEdit(toDraft(p))} className={`${btn} flex-1 bg-ink text-cream`}>{t("edit")}</button>
                  <button onClick={() => setTarget(p)} className={`${btn} border border-terra text-terra`}>{t("delete")}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </State>

      {target && <Confirm locale={locale} subject={target.title[locale]} onCancel={() => setTarget(null)} onConfirm={() => { remove.mutate(String(target._id)); setTarget(null); }} />}
    </section>
  );
}

function ProjectForm({ draft, locale, onDone }: { draft: Draft; locale: Locale; onDone: () => void }) {
  const t = useTranslations("Admin");
  const v = useTranslations("Validation");
  const c = COPY[locale];
  const { create, update, upload } = useProjectMutations();
  const [d, setD] = useState(draft);
  const [errors, setErrors] = useState<FieldErrors>({});
  const [failed, setFailed] = useState(false);
  const [fileError, setFileError] = useState("");
  const [over, setOver] = useState(false);
  const [vp, setVp] = useState<number | null>(null);
  const [videoError, setVideoError] = useState("");
  const [overV, setOverV] = useState(false);
  const dirty = JSON.stringify(d) !== JSON.stringify(draft);
  const saving = create.isPending || update.isPending;
  useSessionGuard(create.error ?? update.error ?? upload.error);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  const set = <K extends keyof Draft>(k: K, value: Draft[K]) => setD((x) => ({ ...x, [k]: value }));
  const setMetric = (i: number, k: keyof Metric, value: string) => set("metrics", d.metrics.map((m, j) => (j === i ? { ...m, [k]: value } : m)));
  const err = (k: string) => { const m = errors[k]?.[0]; return m ? v(m) : undefined; };
  const badMetric = (m: Metric) => Object.values(m).some((x) => x.trim()) && !Object.values(m).every((x) => x.trim());

  const submit: NonNullable<ComponentProps<"form">["onSubmit"]> = (e) => {
    e.preventDefault();
    setFailed(false);
    if (d.metrics.some(badMetric)) return setErrors({ metrics: ["required"] });
    const payload = { ...d, id: undefined, metrics: d.metrics.filter((m) => m.value.trim()), tags: splitTags(d.tags), order: Number(d.order) || 0 };
    const r = projectSchema.safeParse(payload);
    if (!r.success) return setErrors(Object.fromEntries(Object.entries(fieldErrors(r.error))));
    setErrors({});
    const opts = { onSuccess: onDone, onError: (x: unknown) => (x instanceof ApiError && x.fields ? setErrors(x.fields) : setFailed(true)) };
    if (d.id) update.mutate({ id: d.id, ...r.data }, opts);
    else create.mutate(r.data, opts);
  };

  const pick = (file?: File) => {
    if (!file) return;
    setFileError("");
    if (!["image/jpeg", "image/png", "image/webp"].includes(file.type) || file.size > 5 * 1024 * 1024) return setFileError(c.badFile);
    upload.mutate(file, {
      onSuccess: (r) => setD((x) => ({ ...x, imageUrl: r.url, imagePublicId: r.publicId })),
      onError: () => setFileError(c.uploadFailed),
    });
  };

  const pickVideo = (file?: File) => {
    if (!file) return;
    setVideoError("");
    if (!["video/mp4", "video/webm"].includes(file.type) || file.size > 50 * 1024 * 1024) return setVideoError(c.badVideo);
    setVp(0);
    uploadVideo(file, setVp)
      .then((r) => setD((x) => ({ ...x, videoUrl: r.url, videoPublicId: r.publicId })))
      .catch(() => setVideoError(c.videoFailed))
      .finally(() => setVp(null));
  };

  const bi = (k: "title" | "description", label: string, lang: Locale, area = false) => {
    const bad = errors[k] || errors[`${k}.${lang}`];
    const props = {
      dir: lang === "ar" ? "rtl" : "ltr", maxLength: k === "title" ? 100 : 1000, value: d[k][lang], className: "input", "aria-invalid": !!bad,
      onChange: (e: { target: { value: string } }) => setD((x) => ({ ...x, [k]: { ...x[k], [lang]: e.target.value } })),
    };
    return <Labeled label={label} error={bad ? v(d[k][lang].trim().length < (k === "title" ? 2 : 10) ? "required" : "too_long") : undefined} hint={String(d[k][lang].length)}>{area ? <textarea rows={4} {...props} /> : <input {...props} />}</Labeled>;
  };

  const text = (k: "link" | "repo" | "category" | "year", extra?: ComponentProps<"input">) => (
    <Labeled label={t(k)} error={err(k)}><input dir="ltr" className="input" aria-invalid={!!errors[k]} value={d[k]} onChange={(e) => set(k, e.target.value)} {...extra} /></Labeled>
  );

  return (
    <form onSubmit={submit} noValidate className="mt-5 grid items-start gap-5 lg:grid-cols-[1fr_20rem]">
      <div className="space-y-5">
        <Section n="1" title={c.basics}>
          <div className="grid gap-4 md:grid-cols-2">
            {bi("title", t("titleAr"), "ar")}{bi("title", t("titleEn"), "en")}
            {bi("description", t("descAr"), "ar", true)}{bi("description", t("descEn"), "en", true)}
          </div>
        </Section>

        <Section n="2" title={c.details}>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="md:col-span-2">
              <Labeled label={t("tags")} error={err("tags")} hint={c.tagsHint}><input dir="ltr" className="input" value={d.tags} onChange={(e) => set("tags", e.target.value)} /></Labeled>
            </div>
            {text("category", { maxLength: 40 })}{text("year", { maxLength: 4, inputMode: "numeric" })}
            {text("link", { type: "url" })}{text("repo", { type: "url" })}
            <Labeled label={t("order")} error={err("order")}><input type="number" min={0} className="input" value={d.order} onChange={(e) => set("order", Number(e.target.value))} /></Labeled>
            <label className="flex cursor-pointer items-center gap-3 self-end rounded-xl bg-sand/60 px-4 py-3 text-sm font-semibold">
              <input type="checkbox" className="size-4 accent-terra" checked={d.featured} onChange={(e) => set("featured", e.target.checked)} />★ {t("featured")}
            </label>
          </div>
        </Section>

        <Section n="3" title={c.numbers}>
          <div className="space-y-2">
            {d.metrics.map((m, i) => (
              <div key={i} className="grid gap-2 md:grid-cols-[6rem_1fr_1fr_auto]">
                {(["value", "ar", "en"] as const).map((k) => {
                  const label = k === "value" ? c.value : k === "ar" ? c.labelAr : c.labelEn;
                  return <input key={k} aria-label={label} placeholder={label} dir={k === "ar" ? "rtl" : "ltr"} className="input" maxLength={k === "value" ? 12 : 40} aria-invalid={!!errors.metrics && badMetric(m)} value={m[k]} onChange={(e) => setMetric(i, k, e.target.value)} />;
                })}
                <button type="button" onClick={() => set("metrics", d.metrics.filter((_, j) => j !== i))} className="px-2 text-sm text-terra underline">{c.removeRow}</button>
              </div>
            ))}
          </div>
          {errors.metrics && <p role="alert" className="mt-2 text-sm text-terra">{c.metricError}</p>}
          <button type="button" disabled={d.metrics.length >= 2} onClick={() => set("metrics", [...d.metrics, { value: "", ar: "", en: "" }])} className={`${btn} mt-3 border border-dashed border-ink/40`}>+ {c.addMetric}</button>
        </Section>

        <Section n="4" title={c.media}>
          <label
            onDragOver={(e) => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={(e) => { e.preventDefault(); setOver(false); if (!upload.isPending) pick(e.dataTransfer.files[0]); }}
            className={`block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition focus-within:border-terra ${over ? "border-terra bg-terra/10" : "border-ink/25"}`}
          >
            <span className="font-semibold">{upload.isPending ? t("uploading") : c.drop}</span>
            <span className="mt-1 block text-xs text-ink/60">{c.limits}</span>
            <input type="file" accept="image/jpeg,image/png,image/webp" disabled={upload.isPending} onChange={(e) => { pick(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" />
          </label>
          {(fileError || err("imageUrl")) && <p role="alert" className="mt-2 text-sm text-terra">{fileError || err("imageUrl")}</p>}

          <div className="mt-5">
            <p className="mb-2 text-sm font-semibold">{c.video}</p>
            {d.videoUrl ? (
              <div className="space-y-2">
                <video src={d.videoUrl} autoPlay muted loop playsInline className="aspect-video w-full rounded-2xl bg-ink object-contain" />
                <button type="button" onClick={() => setD((x) => ({ ...x, videoUrl: "", videoPublicId: "" }))} className={`${btn} border border-terra text-terra`}>{c.removeVideo}</button>
              </div>
            ) : (
              <label
                onDragOver={(e) => { e.preventDefault(); setOverV(true); }}
                onDragLeave={() => setOverV(false)}
                onDrop={(e) => { e.preventDefault(); setOverV(false); if (vp === null) pickVideo(e.dataTransfer.files[0]); }}
                className={`block cursor-pointer rounded-2xl border-2 border-dashed p-8 text-center transition focus-within:border-terra ${overV ? "border-terra bg-terra/10" : "border-ink/25"}`}
              >
                <span className="font-semibold">{vp !== null ? `${t("uploading")} ${vp}%` : c.dropVideo}</span>
                {vp !== null && <span className="mx-auto mt-3 block h-1.5 w-48 overflow-hidden rounded-full bg-ink/10"><span className="block h-full bg-terra transition-[width]" style={{ width: `${vp}%` }} /></span>}
                <span className="mt-1 block text-xs text-ink/60">{c.videoLimits}</span>
                <input type="file" accept="video/mp4,video/webm" disabled={vp !== null} onChange={(e) => { pickVideo(e.target.files?.[0]); e.target.value = ""; }} className="sr-only" />
              </label>
            )}
            {(videoError || err("videoUrl")) && <p role="alert" className="mt-2 text-sm text-terra">{videoError || err("videoUrl")}</p>}
          </div>
        </Section>
      </div>

      <aside className="space-y-4 lg:sticky lg:top-6">
        <div className={`${card} p-0! overflow-hidden`}>
          <p className="bg-ink px-4 py-2 text-xs font-semibold text-cream">{c.preview}</p>
          <div className="halftone relative aspect-video">
            {d.videoUrl
              ? <video src={d.videoUrl} autoPlay muted loop playsInline className="absolute inset-0 size-full object-contain" />
              : d.imageUrl && <Image src={d.imageUrl} alt="" fill sizes="320px" className="object-contain" />}
          </div>
          <div className="p-4">
            <p className="text-xs text-ink/60">{[d.category, d.year].filter(Boolean).join(" · ")}</p>
            <h3 className="font-display mt-1 text-2xl">{d.title[locale] || c.untitled}</h3>
            <p className="mt-1 line-clamp-3 text-sm text-ink/70">{d.description[locale]}</p>
            <ul className="mt-3 flex flex-wrap gap-1.5">{splitTags(d.tags).map((tag, i) => <li key={`${tag}-${i}`} dir="ltr" className="rounded-full bg-sand px-2.5 py-0.5 text-xs">{tag}</li>)}</ul>
          </div>
        </div>
        {Object.keys(errors).length > 0 && <p role="alert" className="rounded-xl border-2 border-dashed border-terra px-3 py-2 text-sm text-terra">{c.check}: <bdi>{Object.keys(errors).join(", ")}</bdi></p>}
        {failed && <p role="alert" className="text-sm text-terra">{t("saveFailed")}</p>}
        <button disabled={saving || upload.isPending || vp !== null} className={`${btn} w-full bg-ink text-cream`}>{t("save")}</button>
        <button type="button" disabled={saving} onClick={() => { if (!dirty || confirm(c.discard)) onDone(); }} className={`${btn} w-full border border-ink`}>{t("cancel")}</button>
      </aside>
    </form>
  );
}

function Messages({ query, locale }: { query: ReturnType<typeof useMessages>; locale: Locale }) {
  const t = useTranslations("Admin");
  const c = COPY[locale];
  const del = useDeleteMessage();
  const [q, setQ] = useState("");
  const [target, setTarget] = useState<{ id: string; name: string } | null>(null);
  const [copied, setCopied] = useState("");
  useSessionGuard(del.error);

  const items = (query.data ?? []).filter((m) => `${m.name} ${m.email} ${m.message}`.toLowerCase().includes(q.trim().toLowerCase()));
  const date = new Intl.DateTimeFormat(locale === "ar" ? "ar-EG" : "en-GB", { dateStyle: "medium", timeStyle: "short", timeZone: "Africa/Cairo" });

  return (
    <section className="mt-5">
      <input type="search" aria-label={c.search} placeholder={c.search} value={q} onChange={(e) => setQ(e.target.value)} className="input" />
      {del.isError && <p role="alert" className="mt-3 text-sm text-terra">{c.deleteFailed}</p>}
      <State query={query} locale={locale} count={items.length} emptyText={query.data?.length ? c.noResults : t("noMessages")}>
        <ul className="mt-5 space-y-3">
          {items.map((m) => (
            <li key={String(m._id)} className={`${card} flex gap-4`}>
              <span aria-hidden className="sun font-display grid size-11 shrink-0 place-items-center rounded-full text-xl text-cream">{Array.from(m.name)[0]}</span>
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap justify-between gap-2">
                  <b><bdi>{m.name}</bdi></b>
                  <time className="text-xs text-ink/55">{date.format(new Date(m.createdAt))}</time>
                </div>
                <p dir="ltr" className="truncate text-start text-sm text-terra">{m.email}</p>
                <p dir="auto" className="mt-2 whitespace-pre-wrap break-words text-sm">{m.message}</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  <ReplyBox id={String(m._id)} locale={locale} repliedAt={m.repliedAt} onSent={() => query.refetch()} />
                  <button onClick={() => navigator.clipboard?.writeText(m.email).then(() => setCopied(String(m._id)))} className={`${btn} bg-sand`}>{copied === String(m._id) ? c.copied : c.copy}</button>
                  <button onClick={() => setTarget({ id: String(m._id), name: m.name })} className={`${btn} text-terra`}>{t("delete")}</button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </State>
      {target && <Confirm locale={locale} subject={target.name} onCancel={() => setTarget(null)} onConfirm={() => { del.mutate(target.id); setTarget(null); }} />}
    </section>
  );
}

function State({ query, locale, count, emptyText, children }: { query: { isPending: boolean; isError: boolean; error: unknown; refetch: () => unknown }; locale: Locale; count: number; emptyText: string; children: ReactNode }) {
  const c = COPY[locale];
  useSessionGuard(query.error);
  if (query.isPending) return <div className="mt-5 grid gap-5 sm:grid-cols-3">{[0, 1, 2].map((i) => <div key={i} className="h-48 animate-pulse rounded-3xl bg-sand" />)}</div>;
  if (query.isError) return <div role="alert" className={`${card} mt-5 text-center`}><p>{c.loadError}</p><button onClick={() => query.refetch()} className={`${btn} mt-3 bg-ink text-cream`}>{c.retry}</button></div>;
  if (!count) return <p className="mt-5 rounded-3xl border-2 border-dashed border-ink/20 p-10 text-center text-ink/65">{emptyText}</p>;
  return <>{children}</>;
}

function Confirm({ locale, subject, onConfirm, onCancel }: { locale: Locale; subject: string; onConfirm: () => void; onCancel: () => void }) {
  const t = useTranslations("Admin");
  const c = COPY[locale];
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => { if (!ref.current?.open) ref.current?.showModal(); }, []);
  return (
    <dialog ref={ref} onClose={onCancel} data-lenis-prevent className="modal-pop-in m-auto w-[min(92vw,24rem)] rounded-3xl bg-cream p-6 text-ink backdrop:bg-ink/60">
      <h2 className="font-display text-2xl">{t("confirmDelete")}</h2>
      <p className="mt-2 font-semibold"><bdi>{subject}</bdi></p>
      <p className="mt-1 text-sm text-ink/65">{c.deleteNote}</p>
      <div className="mt-5 flex gap-2">
        <button autoFocus onClick={onCancel} className={`${btn} flex-1 border border-ink`}>{c.cancel}</button>
        <button onClick={onConfirm} className={`${btn} flex-1 bg-terra text-cream`}>{t("delete")}</button>
      </div>
    </dialog>
  );
}