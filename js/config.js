/* ================================================================
   Creative3Design — Configuration File
   ⚠️ عبّئ القيم الفعلية قبل الرفع على Vercel
   ⚠️ Fill in actual values before deploying to Vercel
   ⚠️ لا ترفع هذا الملف على GitHub إذا كان يحتوي بيانات حقيقية
================================================================ */
window.C3D_CONFIG = {

  /* ── Supabase ──────────────────────────────────────────────────
     الحصول عليها من: https://supabase.com/dashboard → Settings → API
  ──────────────────────────────────────────────────────────────── */
  supabase: {
    // ⚠️ الرابط الصحيح يبدأ بـ https:// وينتهي بـ .supabase.co فقط
    // مثال صحيح:   'https://abcdefghijklmnop.supabase.co'
    // مثال خاطئ:  'https://creative3design-cloud.vercel.app/index.html'  ← هذا رابط Vercel وليس Supabase
    //
    // 📍 أين تجده؟
    //    supabase.com/dashboard → اختر مشروعك → Settings → API → Project URL
    url:     'https://YOUR_PROJECT_ID.supabase.co',   // ← ضع هنا Project URL من Supabase

    // ⚠️ المفتاح يجب أن يكون كاملاً (JWT طويل يبدأ بـ eyJ ولا ينتهي بـ ...)
    // 📍 أين تجده؟
    //    supabase.com/dashboard → Settings → API → anon (public) key
    anonKey: 'YOUR_FULL_ANON_KEY_FROM_SUPABASE',      // ← ضع هنا anon key من Supabase
  },

  /* ── Cloudinary ────────────────────────────────────────────────
     الحصول عليها من: https://cloudinary.com/console
     أنشئ Upload Preset من نوع "Unsigned" وسمّه creative3design
  ──────────────────────────────────────────────────────────────── */
  cloudinary: {
    cloudName:    'dwh2y3lvz',    // ← استبدل (مثال: mycompany)
    uploadPreset: 'creative3design',    // ← اسم الـ Unsigned Preset
    folder:       'creative3design/portfolio',
  },

  /* ── Site ──────────────────────────────────────────────────────
     معلومات الموقع لتوليد نصوص SEO
  ──────────────────────────────────────────────────────────────── */
  site: {
    nameAr:    'Creative3Design',
    locationAr: 'القاهرة',
    locationEn: 'Cairo',
  },

};
