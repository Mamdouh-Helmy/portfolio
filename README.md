# Portfolio — Next.js 16 + Tailwind 4 + next-intl

1. `npm i`
2. `cp .env.example .env.local` وعبّي القيم. الباسورد: `npm run hash -- "كلمة-المرور"` وحط الناتج في `ADMIN_PASSWORD_HASH`
3. حط صورتك في `public/images/hero.svg (استبدلها بصورتك وغيّر المسار في Hero.tsx)` وملف السيرة في `public/cv.pdf`
4. `npm run dev` → `/ar` و `/en` ، الأدمن: `/ar/admin/login`

## الأمان
- `src/proxy.ts` يحمي `/[locale]/admin` و`/api/admin/*` (JWT في httpOnly cookie, SameSite=Strict)
- كل route في `/api/admin` بيعيد التحقق + فحص Origin (CSRF) — defense in depth
- Zod schema واحدة للـ client والـ server (`src/lib/validation.ts`)، rate limit على اللوجين
- `npm run seed` يضيف مشاريع تجريبية بصور placeholder
