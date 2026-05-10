-- ================================================================
--  Creative3Design — Supabase Database Setup
--  قم بتشغيل هذا الملف في: Supabase Dashboard → SQL Editor
-- ================================================================

-- 1) تفعيل UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
--  2) جدول المشاريع (projects)
-- ================================================================
CREATE TABLE IF NOT EXISTS projects (

  -- المفتاح الأساسي
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,

  -- ─── أساسيات المشروع ───────────────────────────────────────
  name_ar              TEXT NOT NULL,           -- اسم المشروع بالعربية (مطلوب)
  name_en              TEXT,                    -- اسم المشروع بالإنجليزية (اختياري)

  -- ─── التصنيف والطراز ───────────────────────────────────────
  category             TEXT NOT NULL            -- التصنيف الأساسي
    CHECK (category IN ('residential','commercial','villa','hospitality','office')),

  style                TEXT NOT NULL            -- الطراز المعماري
    CHECK (style IN ('modern','classic','contemporary','neoclassic','minimal','luxury')),

  -- ─── الموقع الجغرافي ───────────────────────────────────────
  location_ar          TEXT,                    -- الموقع بالعربية  (مثال: التجمع الخامس، القاهرة)
  location_en          TEXT,                    -- الموقع بالإنجليزية (مثال: New Cairo)

  -- ─── الوصف ─────────────────────────────────────────────────
  description_ar       TEXT,                    -- وصف المشروع بالعربية
  description_en       TEXT,                    -- وصف المشروع بالإنجليزية

  -- ─── الصورة ────────────────────────────────────────────────
  image_url            TEXT,                    -- رابط الصورة من Cloudinary
  cloudinary_public_id TEXT,                    -- Cloudinary Public ID (للحذف لاحقاً)
  image_alt_ar         TEXT,                    -- Alt Text للصورة (عربي) — SEO
  image_alt_en         TEXT,                    -- Alt Text للصورة (إنجليزي) — SEO

  -- ─── SEO ───────────────────────────────────────────────────
  seo_title            TEXT,                    -- عنوان الصفحة لمحركات البحث
  seo_description      TEXT,                   -- وصف محركات البحث (150-160 حرف)
  seo_keywords         TEXT,                    -- كلمات مفتاحية مفصولة بفاصلة

  -- ─── إعدادات العرض ─────────────────────────────────────────
  featured             BOOLEAN   DEFAULT FALSE, -- مشروع مميز (يظهر أولاً)
  sort_order           INTEGER   DEFAULT 0,     -- ترتيب العرض (رقم أصغر = أعلى)
  status               TEXT      DEFAULT 'published'
    CHECK (status IN ('published','draft')),    -- حالة النشر

  -- ─── توقيتات ───────────────────────────────────────────────
  created_at           TIMESTAMPTZ DEFAULT NOW(),
  updated_at           TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
--  3) Trigger لتحديث updated_at تلقائياً
-- ================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_projects_updated_at ON projects;
CREATE TRIGGER trg_projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ================================================================
--  4) Row Level Security (RLS)
-- ================================================================
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;

-- الزوار (القراءة فقط) — المشاريع المنشورة
CREATE POLICY "public_select_published"
  ON projects FOR SELECT
  USING (status = 'published');

-- المسؤول (كل العمليات) — يتطلب تسجيل الدخول عبر Supabase Auth
CREATE POLICY "admin_all"
  ON projects FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- ================================================================
--  5) Index للبحث والفلترة السريعة
-- ================================================================
CREATE INDEX IF NOT EXISTS idx_projects_category  ON projects (category);
CREATE INDEX IF NOT EXISTS idx_projects_status    ON projects (status);
CREATE INDEX IF NOT EXISTS idx_projects_featured  ON projects (featured);
CREATE INDEX IF NOT EXISTS idx_projects_sort      ON projects (sort_order, created_at DESC);

-- ================================================================
--  6) بيانات تجريبية للاختبار
--     يمكنك حذف هذا القسم بعد إضافة مشاريعك الحقيقية
-- ================================================================
INSERT INTO projects
  (name_ar, name_en, category, style, location_ar, location_en,
   description_ar, image_url, image_alt_ar, seo_title, seo_description,
   featured, sort_order)
VALUES
  (
    'شقة التجمع الخامس الفاخرة', 'New Cairo Luxury Apartment',
    'residential', 'modern',
    'التجمع الخامس، القاهرة', 'New Cairo',
    'شقة سكنية فاخرة بطراز مودرن عصري، تجمع بين البساطة والأناقة في كل تفصيلة.',
    'https://images.unsplash.com/photo-1600210492486-724fe5c67fb3?w=800&q=80',
    'تصميم شقة مودرن فاخرة - التجمع الخامس - Creative3Design',
    'تصميم شقة مودرن فاخرة بالتجمع الخامس | Creative3Design',
    'شقة سكنية فاخرة بطراز مودرن في التجمع الخامس. تصميم Creative3Design — مكتب تصميم داخلي معتمد.',
    TRUE, 1
  ),
  (
    'مقر شركة التجمع', 'New Cairo Corporate Office',
    'commercial', 'contemporary',
    'التجمع الأول، القاهرة', 'New Cairo',
    'تصميم مكتبي احترافي يعكس هوية الشركة ويرفع من كفاءة بيئة العمل.',
    'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
    'تصميم مكتب شركة احترافي - التجمع - Creative3Design',
    'تصميم مكتب شركة احترافي بالتجمع | Creative3Design',
    'مقر شركة بتصميم معاصر في التجمع القاهرة. Creative3Design — خبرة 22 سنة في التصميم التجاري.',
    FALSE, 2
  ),
  (
    'فيلا الشيخ زايد', 'Sheikh Zayed Villa',
    'villa', 'neoclassic',
    'الشيخ زايد، الجيزة', 'Sheikh Zayed, Giza',
    'فيلا نيوكلاسيك فاخرة تجمع بين الأصالة والحداثة بأعلى مستويات التشطيب.',
    'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
    'فيلا نيوكلاسيك فاخرة - الشيخ زايد - Creative3Design',
    'تصميم فيلا نيوكلاسيك فاخرة بالشيخ زايد | Creative3Design',
    'فيلا سكنية بطراز نيوكلاسيك في الشيخ زايد. Creative3Design — تصاميم راقية لكل تفصيلة.',
    TRUE, 3
  ),
  (
    'مطعم الجزيرة الفاخر', 'Al-Jazira Luxury Restaurant',
    'hospitality', 'luxury',
    'الجزيرة، القاهرة', 'Zamalek, Cairo',
    'تصميم مطعم فاخر بإضاءة ساحرة وديكور استثنائي يمنح الضيوف تجربة لا تُنسى.',
    'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800&q=80',
    'تصميم مطعم فاخر - الزمالك القاهرة - Creative3Design',
    'تصميم مطعم فاخر بالزمالك القاهرة | Creative3Design',
    'مطعم فاخر بتصميم استثنائي في الزمالك. Creative3Design — تصميم ضيافة بمعايير عالمية.',
    FALSE, 4
  ),
  (
    'شقة الزمالك الكلاسيكية', 'Zamalek Classic Apartment',
    'residential', 'classic',
    'الزمالك، القاهرة', 'Zamalek, Cairo',
    'شقة كلاسيكية راقية تعكس الذوق الرفيع والأناقة الخالدة في قلب القاهرة.',
    'https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?w=800&q=80',
    'تصميم شقة كلاسيكية راقية - الزمالك - Creative3Design',
    'تصميم شقة كلاسيكية راقية بالزمالك | Creative3Design',
    'شقة كلاسيكية فاخرة في الزمالك القاهرة. Creative3Design — تصاميم تجمع الأصالة والرقي.',
    FALSE, 5
  ),
  (
    'فيلا القاهرة الجديدة', 'New Cairo Villa',
    'villa', 'modern',
    'القاهرة الجديدة', 'New Cairo',
    'فيلا مودرن فاخرة بمساحات مفتوحة وإضاءة طبيعية تُعظّم تجربة السكن.',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'تصميم فيلا مودرن فاخرة - القاهرة الجديدة - Creative3Design',
    'تصميم فيلا مودرن فاخرة بالقاهرة الجديدة | Creative3Design',
    'فيلا سكنية مودرن في القاهرة الجديدة. Creative3Design — تصميم يجمع الجمال والوظيفية.',
    FALSE, 6
  );

-- ================================================================
--  ✅ اكتملت الإعدادات
--  الخطوة التالية: أضف مستخدم Admin من:
--  Supabase Dashboard → Authentication → Users → Invite User
-- ================================================================
