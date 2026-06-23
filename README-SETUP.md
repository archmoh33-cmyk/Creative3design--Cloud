# Creative3Design — دليل التفعيل والرفع على Vercel

## الخطوات المطلوبة (بالترتيب)

---

## 1️⃣ إنشاء مشروع Supabase

1. اذهب إلى [supabase.com](https://supabase.com) وأنشئ حساباً مجانياً
2. أنشئ مشروعاً جديداً (New Project)
3. احتفظ بـ **Project URL** و **anon (public) key**
4. اذهب إلى **SQL Editor** والصق محتوى ملف `supabase-setup.sql` بالكامل، ثم اضغط **Run**
5. اذهب إلى **Authentication → Users → Invite User** وأضف بريد Admin

---

## 2️⃣ إنشاء حساب Cloudinary

1. اذهب إلى [cloudinary.com](https://cloudinary.com) وأنشئ حساباً مجانياً
2. من الـ Dashboard احتفظ بـ **Cloud Name**
3. اذهب إلى **Settings → Upload → Upload Presets**
4. أنشئ Preset جديداً:
   - **Preset Name:** `creative3design`
   - **Signing Mode:** `Unsigned` ✅ (مهم جداً)
   - **Folder:** `creative3design/portfolio`
   - اضغط **Save**

---

## 3️⃣ تعبئة ملف الإعدادات

افتح ملف `js/config.js` واستبدل القيم:

```javascript
supabase: {
  url:     'https://XXXXXXXXXXXX.supabase.co',   // ← Project URL
  anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',  // ← anon key
},
cloudinary: {
  cloudName:    'mycompanyname',   // ← Cloud Name
  uploadPreset: 'creative3design', // ← اسم الـ Preset
},
```

---

## 4️⃣ الرفع على Vercel

### الطريقة السريعة (Vercel CLI):
```bash
npm i -g vercel
cd "موقعي الاليكتروني Creative3design"
vercel --prod
```

### أو من خلال واجهة Vercel:
1. اذهب إلى [vercel.com](https://vercel.com)
2. اضغط **New Project → Import Git Repository**
3. ارفع المجلد أو اربطه بـ GitHub
4. اضغط **Deploy**

---

## 5️⃣ بعد الرفع

| الرابط | الوصف |
|--------|-------|
| `your-domain.com/portfolio.html` | معرض الأعمال الديناميكي |
| `your-domain.com/admin` | لوحة التحكم |

---

## هيكل الملفات المضافة

```
📁 موقعي الاليكتروني Creative3design/
├── 📄 vercel.json              ← إعدادات Vercel
├── 📄 supabase-setup.sql       ← SQL Schema لقاعدة البيانات
├── 📁 admin/
│   └── 📄 index.html           ← لوحة التحكم الكاملة
└── 📁 js/
    ├── 📄 config.js            ← ⚠️ عبّئ هذا الملف بإعداداتك
    └── 📄 supabase-client.js   ← Supabase Client المشترك
```

---

## جدول قاعدة البيانات (projects)

| الحقل | النوع | الوصف |
|-------|-------|-------|
| `name_ar` | TEXT | اسم المشروع بالعربية ✅ مطلوب |
| `name_en` | TEXT | اسم المشروع بالإنجليزية |
| `category` | TEXT | التصنيف: residential / commercial / villa / hospitality / office |
| `style` | TEXT | الطراز: modern / classic / contemporary / neoclassic / minimal / luxury |
| `location_ar` | TEXT | الموقع بالعربية (للـ SEO) |
| `description_ar` | TEXT | وصف المشروع بالعربية |
| `image_url` | TEXT | رابط الصورة من Cloudinary |
| `image_alt_ar` | TEXT | Alt Text للصورة — يُقوّي SEO |
| `seo_title` | TEXT | عنوان صفحة محركات البحث |
| `seo_description` | TEXT | وصف محركات البحث |
| `featured` | BOOLEAN | مشروع مميّز (يظهر أولاً) |
| `status` | TEXT | published / draft |

---

## ملاحظات مهمة

- ⚠️ **لا ترفع `js/config.js` على GitHub العام** — يحتوي على مفاتيح API
- الـ `anonKey` في Supabase آمن للاستخدام في الواجهة الأمامية (RLS تحميه)
- لوحة التحكم تتطلب تسجيل دخول بالبريد وكلمة المرور عبر Supabase Auth
- الموقع يعمل **بدون Supabase** بالبيانات الثابتة المدمجة (fallback تلقائي)


<!-- redeploy trigger: Day24 Maadi geo page (2026-06-23) -->
