// node scripts/use-webp.mjs
import { existsSync, readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join } from "node:path";

const walk = (dir) =>
  !existsSync(dir) ? [] : readdirSync(dir).flatMap((n) => {
    const p = join(dir, n);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });

const files = ["src", "messages", "scripts"].flatMap(walk)
  .filter((f) => /\.(tsx?|jsx?|mjs|json|css)$/.test(f) && !/(use-webp|optimize-images)\.mjs$/.test(f));

for (const file of files) {
  const old = readFileSync(file, "utf8");
  // بيبدّل بس لو نسخة الـ webp موجودة فعلًا
  const next = old.replace(/images\/([\w-]+)\.png/g, (m, name) => (existsSync(`public/images/${name}.webp`) ? `images/${name}.webp` : m));
  if (next !== old) {
    writeFileSync(file, next);
    console.log("updated:", file);
  }
  next.split("\n").forEach((line, i) => {
    if (line.includes(".png")) console.log(`check:   ${file}:${i + 1}  ${line.trim().slice(0, 100)}`);
  });
}