/* ================================================================
   Creative3Design — Supabase Shared Client
   يُضاف هذا الملف في كل صفحة تحتاج بيانات من Supabase
   الترتيب: config.js → supabase CDN → هذا الملف
================================================================ */
(function () {
  'use strict';

  const cfg = window.C3D_CONFIG?.supabase;

  /* ── التحقق من صحة إعدادات Supabase ────────────────────────── */
  const issues = [];

  if (!cfg?.url || cfg.url.includes('YOUR_PROJECT_ID') || cfg.url.includes('vercel.app')) {
    issues.push(
      '🔴 Supabase URL خاطئ أو مفقود.\n' +
      '   الصحيح: https://XXXXXXXXXXXX.supabase.co\n' +
      '   المصدر: supabase.com/dashboard → مشروعك → Settings → API → Project URL'
    );
  } else if (!cfg.url.includes('.supabase.co')) {
    issues.push(
      '🔴 Supabase URL لا يبدو صحيحاً — يجب أن ينتهي بـ .supabase.co\n' +
      '   مثال: https://abcdefghijklmnop.supabase.co'
    );
  }

  if (!cfg?.anonKey || cfg.anonKey.includes('YOUR_') || cfg.anonKey.endsWith('...')) {
    issues.push(
      '🔴 Supabase anon key خاطئ أو مبتور.\n' +
      '   يجب أن يكون JWT كاملاً يبدأ بـ eyJ ويمتد لأكثر من 100 حرف.\n' +
      '   المصدر: supabase.com/dashboard → Settings → API → anon (public)'
    );
  }

  if (issues.length) {
    console.error('[C3D Supabase] ❌ أخطاء في الإعداد:\n' + issues.join('\n\n'));
    window.c3dClient      = null;
    window.C3D_STATIC_MODE = true;
    window.C3D_CONFIG_ERRORS = issues; // يُستخدم في لوحة التحكم لعرض رسائل واضحة
    return;
  }

  /* ── تأكّد من وجود مكتبة Supabase في الصفحة ───────────────── */
  if (typeof supabase === 'undefined') {
    const msg = '🔴 مكتبة Supabase JS غير محمّلة — تحقّق من رابط CDN في الـ HTML';
    console.error('[C3D]', msg);
    window.c3dClient = null;
    window.C3D_CONFIG_ERRORS = [msg];
    return;
  }

  /* ── إنشاء الـ Client ───────────────────────────────────────── */
  try {
    window.c3dClient = supabase.createClient(cfg.url, cfg.anonKey, {
      auth: { autoRefreshToken: true, persistSession: true },
    });
    window.C3D_STATIC_MODE  = false;
    window.C3D_CONFIG_ERRORS = [];
    console.info('[C3D] Supabase Client جاهز ✓', cfg.url);
  } catch (e) {
    console.error('[C3D] فشل إنشاء Supabase Client:', e.message);
    window.c3dClient         = null;
    window.C3D_STATIC_MODE   = true;
    window.C3D_CONFIG_ERRORS = ['🔴 فشل إنشاء Supabase Client: ' + e.message];
  }

})();

/* ── Helper: جلب مشاريع منشورة مع فلتر اختياري ──────────────── */
window.c3dFetchProjects = async function (options = {}) {
  if (!window.c3dClient) return { data: null, error: { message: 'static mode' } };

  const { category = null, limit = 50, featured = null } = options;

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

/* ── Helper: توليد Alt Text ديناميكي (SEO) ─────────────────────
   مثال: "شقة التجمع - سكني مودرن - القاهرة - Creative3Design"
──────────────────────────────────────────────────────────────── */
window.c3dAltText = function (project, lang = 'ar') {
  if (lang === 'en') {
    const name  = project.name_en     || project.name_ar;
    const cat   = c3dCategoryLabel(project.category, 'en');
    const style = c3dStyleLabel(project.style, 'en');
    const loc   = project.location_en || 'Cairo';
    return project.image_alt_en || `${name} - ${cat} ${style} - ${loc} - Creative3Design`;
  }
  const name  = project.name_ar;
  const cat   = c3dCategoryLabel(project.category, 'ar');
  const style = c3dStyleLabel(project.style, 'ar');
  const loc   = project.location_ar || 'القاهرة';
  return project.image_alt_ar || `${name} - ${cat} ${style} - ${loc} - Creative3Design`;
};

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
