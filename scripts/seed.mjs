// npm run seed  — inserts sample projects (placeholder images) so the section isn't empty
import mongoose from "mongoose";
await mongoose.connect(process.env.MONGODB_URI);
const col = mongoose.connection.collection("projects");
await col.deleteMany({ imagePublicId: "seed" });
const now = new Date();
const base = { imageUrl: "/images/project.svg", imagePublicId: "seed", link: "https://example.com", repo: "https://github.com", createdAt: now, updatedAt: now, metrics: [], category: "", year: "" };
await col.insertMany([
  { ...base, order: 0, featured: true, category: "E-commerce", year: "2025",
    title: { ar: "دُكّان — متجر عربي متكامل", en: "Dukkan — a complete Arabic store" },
    description: { ar: "منصة تجارة إلكترونية ثنائية اللغة لأكثر من ٣٠ تاجرًا محليًا، مع دفع فوري، وإدارة مخزون لحظية، ولوحة تحليلات للبائعين.", en: "A bilingual e-commerce platform for 30+ local merchants with instant payments, live inventory and seller analytics." },
    tags: ["Next.js", "TypeScript", "MongoDB", "Stripe", "Tailwind"],
    metrics: [{ value: "+40%", ar: "زيادة في معدل التحويل", en: "Conversion lift" }, { value: "0.8s", ar: "زمن تحميل الصفحة الأولى", en: "First page load" }] },
  { ...base, order: 1, title: { ar: "مرسال", en: "Mersal" }, description: { ar: "تطبيق محادثات فوري للفِرَق، يدعم القنوات والملفات والمكالمات.", en: "Real-time team chat with channels, files and calls." }, tags: ["React", "Socket.io", "Node.js"] },
  { ...base, order: 2, title: { ar: "ميزان", en: "Mizan" }, description: { ar: "منصة محاسبية سحابية للشركات الناشئة مع تقارير وفواتير ضريبية.", en: "Cloud accounting for startups with reports and tax invoices." }, tags: ["Next.js", "TypeScript", "PostgreSQL"] },
  { ...base, order: 3, title: { ar: "صفّة", en: "Saffa" }, description: { ar: "لوحة تحكم لإدارة المدارس: الجداول والحضور والدرجات في مكان واحد.", en: "A school dashboard: schedules, attendance and grades in one place." }, tags: ["React", "Redux", "Tailwind"] },
  { ...base, order: 4, title: { ar: "دليل", en: "Daleel" }, description: { ar: "دليل مطاعم ذكي مع خرائط تفاعلية وحجز طاولات فوري.", en: "A smart restaurant guide with interactive maps and instant booking." }, tags: ["Next.js", "Node.js", "Mapbox"] },
]);
console.log("seeded");
await mongoose.disconnect();
