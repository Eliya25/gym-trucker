# 🏋️ יומן אימונים — Gym Workout Tracker

אפליקציית ווב לתיעוד אימונים בחדר כושר: תרגילים, סטים, חזרות, משקלים ופידבק בסוף כל אימון.

**סטק:** Next.js 16 (App Router) · React · TypeScript · Tailwind CSS · Supabase (Postgres + Auth)

## הקמה ראשונית (פעם אחת)

### 1. יצירת פרויקט Supabase

1. היכנס ל-[supabase.com](https://supabase.com) וצור פרויקט חדש (חינם).
2. לך ל-**SQL Editor** והרץ את התוכן של `supabase/migrations/0001_init.sql` (יוצר את הטבלאות וה-RLS).
3. אחר-כך הרץ את התוכן של `supabase/seed.sql` (רשימת תרגילים בסיסית).
4. **מומלץ לפיתוח מקומי:** ב-**Authentication → Sign In / Up → Email**, כבה את "Confirm email" כדי שלא תצטרך לאשר אימייל בכל הרשמה.

### 2. משתני סביבה

העתק את `.env.example` ל-`.env.local` ומלא את הערכים מ-**Project Settings → API** בדשבורד של Supabase:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 3. הרצה

```bash
npm install
npm run dev
```

פתח [http://localhost:3000](http://localhost:3000), הירשם, והתחל לתעד אימונים.

## מה יש באפליקציה (Phase 1)

- **הרשמה / התחברות** — חשבון אישי לכל מתאמן, כל אחד רואה רק את הנתונים שלו (RLS).
- **אימון חדש** — התחלת אימון, בחירת תרגילים מרשימה (או הוספת תרגיל אישי), תיעוד סטים עם חזרות ומשקל תוך כדי אימון.
- **סיום אימון + פידבק** — דירוג קושי (1-5) והערות חופשיות.
- **היסטוריה** — רשימת כל האימונים שהושלמו + צפייה בפרטי כל אימון (כולל נפח כולל).
- **ניהול תרגילים** — הוספה ומחיקה של תרגילים אישיים לצד רשימת התרגילים הכללית.

## שלבים הבאים (מתוכנן)

- **Phase 2:** מעקב משקל גוף + גרפים של התקדמות.
- **Phase 2/3:** תמונות התקדמות (Supabase Storage).
- **Phase 3:** תוכניות אימון מובנות מראש + בניית תוכנית אישית והתחלת אימון מתוכנית.

## פקודות שימושיות

| פקודה | תיאור |
|---|---|
| `npm run dev` | שרת פיתוח |
| `npm run build` | בנייה לפרודקשן (כולל בדיקת טיפוסים) |
| `npm run lint` | בדיקת ESLint |

## עדכון טיפוסי הדאטהבייס

הקובץ `lib/types/database.types.ts` נכתב ידנית לפי הסכימה. אם תשנה את הסכימה, אפשר לג'נרט אותו אוטומטית:

```bash
npx supabase gen types typescript --project-id <project-ref> --schema public > lib/types/database.types.ts
```
