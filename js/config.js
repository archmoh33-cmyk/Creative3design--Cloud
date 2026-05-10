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
    url:     'https://creative3design-cloud.vercel.app/index.html',   // ← استبدل
    anonKey: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',                 // ← استبدل
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
