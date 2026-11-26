/* ---------- المحتوى (عدّله براحتك) ---------- */
export type Copy = {
  role: string;
  noteHeader: string;
  noteMe: string;
  quote: string;
  available: string;
  principlesTitle: string;
  principles: { t: string; d: string }[];
  processTitle: string;
  process: { t: string; d: string }[];
  ctaTitle: string;
  ctaBtn: string;
};

export const copy: Record<"ar" | "en", Copy> = {
  ar: {
    role: "مطوّر Full-stack",
    noteHeader: "اتعرف عليا",
    noteMe: "ده أنا (تقريباً)",
    quote: "بحب أبني حاجات الناس تحس بيها، مش بس تشوفها.",
    available: "متاح لمشاريع جديدة",
    principlesTitle: "قواعدي في الشغل",
    principles: [
      { t: "كود نضيف", d: "مقروء ومترتب وسهل تصلحه وتزوّد عليه." },
      { t: "سرعة من الأول", d: "السرعة بتتحط من أول يوم، مش بتتصلّح في الآخر." },
      { t: "التفاصيل", d: "المسافات والحركة والكلام المكتوب، التفاصيل الصغيرة هي اللي بتفرق." },
    ],
    processTitle: "الشغل بيمشي إزاي",
    process: [
      { t: "الفكرة والتخطيط", d: "نفهم إنت عايز إيه وجمهورك مين، ونرسم خطة واضحة." },
      { t: "التصميم", d: "واجهات متصممة على مقاس مشروعك، مش قوالب جاهزة." },
      { t: "البرمجة", d: "كود نضيف وسريع وسهل يكبر مع المشروع." },
      { t: "الإطلاق والدعم", d: "نرفع المشروع وأفضل معاك بعد الإطلاق." },
    ],
    ctaTitle: "عندك فكرة؟ تعالى نحوّلها لحاجة حقيقية.",
    ctaBtn: "ابدأ مشروعك",
  },
  en: {
    role: "Full-stack developer",
    noteHeader: "meet the maker",
    noteMe: "that's me (roughly)",
    quote: "I like building things you feel, not just see.",
    available: "Available for new projects",
    principlesTitle: "My rules",
    principles: [
      { t: "Clean code", d: "Readable, organized, easy to fix and extend." },
      { t: "Fast from day one", d: "Speed is built in at the start, not patched on at the end." },
      { t: "Details", d: "Spacing, motion, copy: the small things make the difference." },
    ],
    processTitle: "How it goes",
    process: [
      { t: "Plan", d: "We figure out your goal and audience, then map the project." },
      { t: "Design", d: "Interfaces made for your project, not templates." },
      { t: "Build", d: "Clean, fast code that can grow with the project." },
      { t: "Launch & support", d: "We ship it, and I stay with you after launch." },
    ],
    ctaTitle: "Got an idea? Let's turn it into something real.",
    ctaBtn: "Start a project",
  },
};