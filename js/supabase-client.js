/* ================================================================
   Creative3Design — Supabase Shared Client
   يُضاف هذا الملف في كل صفحة تحتاج بيانات من Supabase
   الترتيب: config.js → supabase CDN → هذا الملف
================================================================ */
(function () {
  'use strict';

  const cfg = window.C3D_CONFIG?.supabase;

  // إذا لم تُعبّأ الإعدادات بعد — وضع ثابت (static mode)
  if (!cfg?.url || cfg.url.includes('YOUR_PROJECT_ID')) {
    console.info('[C3D] Supabase غير مُهيّأ — سيعمل الموقع بالبيانات الثابتة');
    window.c3dClient = null;
    window.C3D_STATIC_MODE = true;
    return;
  }

  // تأكّد من وجود مكتبة Supabase في الصفحة
  if (typeof supabase === 'undefined') {
    console.error('[C3D] مكتبة Supabase JS غير محمّلة — تحقّق من رابط CDN');
    window.c3dClient = null;
    return;
  }

  window.c3dClient = supabase.createClient(cfg.url, cfg.anonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession:   true,
    },
  });

  window.C3D_STATIC_MODE = false;
  console.info('[C3D] Supabase Client جاهز ✓');
})();

/* ── Helper: جلب مشاريع منشورة مع فلتر اختياري ──────────────── */
window.c3dFetchProjects = async function (options = {}) {
  if (!window.c3dClient) return { data: null, error: { message: 'static mode' } };

  const {
    category = null,
    limit    = 50,
    featured = null,
  } = options;

  let q = window.c3dClient
    .from('projects')
    .select('*')
    .eq('status', 'published')
    .order('sort_order', { ascending: true })
    .order('created_at',  { ascending: false })
    .limit(limit);

  if (category && category !== 'all') q = q.eq('category', category);
  if (featured !== null)              q = q.eq('featured', featured);

  return await q;
};

/* ── Helper: توليد Alt Text للصورة (SEO) ───────────────────────
   مثال: "شقة التجمع الخامس - سكني مودرن - القاهرة - Creative3Design"
──────────────────────────────────────────────────────────────── */
window.c3dAltText = function (project, lang = 'ar') {
  if (lang === 'en') {
    const name    = project.name_en     || project.name_ar;
    const cat     = c3dCategoryLabel(project.category, 'en');
    const style   = c3dStyleLabel(project.style, 'en');
    const loc     = project.location_en || 'Cairo';
    return project.image_alt_en || `${name} - ${cat} ${style} - ${loc} - Creative3Design`;
  }
  const name  = project.name_ar;
  const cat   = c3dCategoryLabel(project.category, 'ar');
  const style = c3dStyleLabel(project.style, 'ar');
  const loc   = project.location_ar || 'القاهرة';
  return project.image_alt_ar || `${name} - ${cat} ${style} - ${loc} - Creative3Design`;
};

/* ── Labels ─────────────────────────────────────────────────── */
window.c3dCategoryLabel = function (cat, lang = 'ar') {
  const map = {
    residential: { ar: 'سكني',    en: 'Residential' },
    commercial:  { ar: 'تجاري',   en: 'Commercial'  },
    villa:       { ar: 'فيلات',   en: 'Villa'       },
    hospitality: { ar: 'ضيافة',   en: 'Hospitality' },
    office:      { ar: 'مكاتب',   en: 'Office'      },
  };
  return map[cat]?.[lang] ?? cat;
};

window.c3dStyleLabel = function (style, lang = 'ar') {
  const map = {
    modern:       { ar: 'مودرن',      en: 'Modern'       },
    classic:      { ar: 'كلاسيك',     en: 'Classic'      },
    contemporary: { ar: 'معاصر',      en: 'Contemporary' },
    neoclassic:   { ar: 'نيوكلاسيك', en: 'Neoclassic'   },
    minimal:      { ar: 'مينيمال',    en: 'Minimal'      },
    luxury:       { ar: 'فاخر',       en: 'Luxury'       },
  };
  return map[style]?.[lang] ?? style;
};
