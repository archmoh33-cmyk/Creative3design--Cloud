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
--     يمكنك حذف هذا القسم بعد إظافة مشاريعك الحقيقية
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
    'تصميم مطعم فاخر بإظاءة ساحرة وديكور استثنائي يمنح الضيوف تجربة لا تُنسى.',
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
    'فيلا مودرن فاخرة بمساحات مفتوحة وإظاءة طبيعية تُعظّم تجربة السكن.',
    'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
    'تصميم فيلا مودرن فاخرة - القاهرة الجديدة - Creative3Design',
    'تصميم فيلا مودرن فاخرة بالقاهرة الجديدة | Creative3Design',
    'فيلا سكنية مودرن في القاهرة الجديدة. Creative3Design — تصميم يجمع الجمال والوظيفية.',
    FALSE, 6
  );

-- ================================================================
--  7) جدول صور المشاريع (project_images) — صور متعددة لكل مشروع
-- ================================================================
CREATE TABLE IF NOT EXISTS project_images (
  id                   UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  project_id           UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  image_url            TEXT NOT NULL,
  cloudinary_public_id TEXT,
  sort_order           INTEGER   DEFAULT 0,
  is_cover             BOOLEAN   DEFAULT FALSE,
  created_at           TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_project_images_project
  ON project_images (project_id, sort_order);

ALTER TABLE project_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_images"
  ON project_images FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM projects p
      WHERE p.id = project_images.project_id
        AND p.status = 'published'
    )
  );

CREATE POLICY "admin_all_images"
  ON project_images FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Trigger: يضمن وجود غلاف واحد فقط لكل مشروع
CREATE OR REPLACE FUNCTION set_single_cover()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_cover = TRUE THEN
    UPDATE project_images
       SET is_cover = FALSE
     WHERE project_id = NEW.project_id
       AND id <> NEW.id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_single_cover ON project_images;
CREATE TRIGGER trg_single_cover
  AFTER INSERT OR UPDATE ON project_images
  FOR EACH ROW
  WHEN (NEW.is_cover = TRUE)
  EXECUTE FUNCTION set_single_cover();

-- ================================================================
--  8) جدول شرائح الهيرو (hero_slides)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.hero_slides (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar              TEXT,
  title_en              TEXT,
  image_url             TEXT,
  cloudinary_public_id  TEXT,
  sort_order            INT  NOT NULL DEFAULT 0,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE hero_slides ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_hero"
  ON hero_slides FOR SELECT USING (active = TRUE);

CREATE POLICY "admin_all_hero"
  ON hero_slides FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_hero_slides_order ON hero_slides (sort_order);

-- ================================================================
--  9) جدول طرق الدفع (payment_methods)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.payment_methods (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar     TEXT NOT NULL,          -- اسم طريقة الدفع بالعربية
  name_en     TEXT,
  type        TEXT NOT NULL           -- vodafone_cash | instapay | visa | easy_cash | bank_transfer
    CHECK (type IN ('vodafone_cash','instapay','visa','easy_cash','bank_transfer','other')),
  account_number TEXT,                -- رقم المحفظة / الحساب
  account_name   TEXT,                -- اسم صاحب الحساب
  instructions_ar TEXT,               -- تعليمات إضافية
  icon_url       TEXT,                -- أيقونة (اختياري)
  active         BOOLEAN NOT NULL DEFAULT TRUE,
  sort_order     INT     NOT NULL DEFAULT 0,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE payment_methods ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_payment"
  ON payment_methods FOR SELECT USING (active = TRUE);

CREATE POLICY "admin_all_payment"
  ON payment_methods FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_payment_sort ON payment_methods (sort_order);

-- بيانات أولية لطرق الدفع
INSERT INTO payment_methods (name_ar, name_en, type, sort_order) VALUES
  ('فودافون كاش',  'Vodafone Cash',  'vodafone_cash',  1),
  ('انستاباي',     'InstaPay',       'instapay',       2),
  ('فيزا / ماستر', 'Visa / Master',  'visa',           3),
  ('إيزي كاش',    'Easy Cash',      'easy_cash',      4)
ON CONFLICT DO NOTHING;

-- ================================================================
--  10) مكتبة الفيديو (video_library)
-- ================================================================
CREATE TABLE IF NOT EXISTS public.video_library (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title_ar              TEXT NOT NULL,
  title_en              TEXT,
  cloudinary_public_id  TEXT,          -- Cloudinary video public_id
  video_url             TEXT,          -- رابط الفيديو (Cloudinary أو YouTube)
  thumbnail_url         TEXT,          -- صورة مصغرة
  duration_sec          INT,           -- مدة الفيديو بالثواني
  category              TEXT DEFAULT 'general',
  sort_order            INT NOT NULL DEFAULT 0,
  active                BOOLEAN NOT NULL DEFAULT TRUE,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE video_library ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_video"
  ON video_library FOR SELECT USING (active = TRUE);

CREATE POLICY "admin_all_video"
  ON video_library FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_video_sort ON video_library (sort_order);

-- ================================================================
--  11) تحديث جدول إعدادات الموقع (site_settings) — إضافة حقل Google Maps
-- ================================================================
-- تأكد من وجود الجدول أولاً (قد يكون موجوداً من قبل)
CREATE TABLE IF NOT EXISTS public.site_settings (
  id           UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key          TEXT UNIQUE NOT NULL,
  value        TEXT,
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_select_settings"
  ON site_settings FOR SELECT USING (true);

CREATE POLICY "admin_all_settings"
  ON site_settings FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

-- إدراج/تحديث حقل Google Maps
INSERT INTO site_settings (key, value) VALUES
  ('google_maps_embed', '')
ON CONFLICT (key) DO NOTHING;

-- ================================================================
--  ✅ اكتملت الإعدادات
--  الخطوات التالية:
--  1) أضف مستخدم Admin من: Supabase → Authentication → Users → Invite User
--  2) ارفع مشاريعك من: /admin/bulk-upload.html
--  3) كل مشروع يمكن أن يظم عدداً غير محدود من الصور في project_images
--  4) شغّل هذا الملف في Supabase SQL Editor لإنشاء الجداول الجديدة
-- ================================================================

-- ══════════════════════════════════════════════════
--  11) جدول الشركاء (partners)
-- ══════════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.partners (
  id         uuid    PRIMARY KEY DEFAULT gen_random_uuid(),
  name_ar    text,
  name_en    text,
  logo_url   text,
  website    text,
  active     boolean NOT NULL DEFAULT true,
  sort_order int     NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE partners ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read active partners"
  ON partners FOR SELECT USING (active = TRUE);

CREATE POLICY "Authenticated manage partners"
  ON partners FOR ALL TO authenticated
  USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_partners_sort ON partners (sort_order);

-- ══════════════════════════════════════════════════
--  الأتعاب — تُخزن في جدول site_settings بمفاتيح:
--   fee_packages  (JSON array)
--   fee_unit      (sqm | sqft)
--   fee_min_area  (رقم)
--  وإعدادات المدونة والشركاء:
--   blog_nav_visible        (true|false)
--   blog_section_visible    (true|false)
--   partners_section_visible (true|false)
-- ══════════════════════════════════════════════════
