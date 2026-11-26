// node scripts/optimize-images.mjs
import { readdir, stat, writeFile } from "node:fs/promises";
import sharp from "sharp";

const DIR = "public/images/certs";
const ALPHA_CUT = 20; // أقل من القديم (60) عشان الحبر الخفيف في ختم ITI وMindset ميتمسحش
const MAX_WIDTH = 800;
const kb = (n) => `${Math.round(n / 1024)}KB`;

/** ويندوز أحياناً بيمسك الملف لحظة (dev server / antivirus)، فنحاول كذا مرة قبل ما نفشل */
async function safeWrite(file, buf, tries = 5) {
  for (let i = 1; i <= tries; i++) {
    try {
      await writeFile(file, buf);
      return;
    } catch (err) {
      if (i === tries) {
        throw new Error(`Can't write ${file}. Close "npm run dev" and any editor/preview that has it open, then retry. (${err.code})`);
      }
      await new Promise((r) => setTimeout(r, 400 * i));
    }
  }
}

/** بيمسح البكسلات شبه الشفافة اللي بتعمل هالة حوالين الختم */
async function clean(file) {
  const { data, info } = await sharp(file).ensureAlpha().raw().toBuffer({ resolveWithObject: true });
  for (let i = 3; i < data.length; i += 4) if (data[i] < ALPHA_CUT) data[i] = 0;
  return sharp(data, { raw: info }).png().toBuffer();
}

const files = (await readdir(DIR)).filter((f) => f.toLowerCase().endsWith(".png"));
if (!files.length) {
  console.warn(`no png files in ${DIR}`);
  process.exit(0);
}

let before = 0;
let after = 0;

for (const name of files) {
  const file = `${DIR}/${name}`;
  const size = (await stat(file)).size;

  // الكتابة بتحصل بعد القراءة كلها في buffer، فنفس الملف ينفع يتقري ويتكتب
  const buf = await sharp(await clean(file))
    .trim() // يقص الحواف الشفافة الزيادة
    .resize({ width: MAX_WIDTH, withoutEnlargement: true })
    .png({ palette: true, quality: 85, compressionLevel: 9, effort: 10 })
    .toBuffer();

  // لو الضغط طلع أكبر من الأصل (ممكن يحصل مع ملفات صغيرة) سيب الأصل زي ما هو
  if (buf.length >= size) {
    console.log(`${name} ${kb(size)} (already small, kept)`);
    before += size;
    after += size;
    continue;
  }

  await safeWrite(file, buf);
  before += size;
  after += buf.length;
  console.log(`${name} ${kb(size)} -> ${kb(buf.length)}`);
}

console.log(`total ${kb(before)} -> ${kb(after)}`);