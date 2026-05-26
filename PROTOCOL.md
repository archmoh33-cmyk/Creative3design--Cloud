# آلية التعديل الآمن — Safe Edit Protocol

> **Version:** 1.0 — 2026-05-26
> **Status:** Active — يجب اتباعه في كل تعديل على موقع Creative3Design
> **Strictness Level:** Medium (تشخيص قبل التعديل + Backup للمخاطر + فحص 1-3 صفحات بعد التعديل)

---

## 🎯 الهدف

منع أن يؤثّر تعديل قسم أو صفحة على باقي الموقع. كل تعديل يجب أن يمرّ بـ **5 مراحل واضحة** قبل أن يُعتبر مكتملاً.

---

## 📊 المرحلة 1: التشخيص قبل التعديل (Pre-Edit Analysis)

قبل أي تعديل، تُحدَّد:

### أ) الملفات المتأثّرة
- **الملف الذي سيُعدّل مباشرةً** (مثل `packages.html`)
- **الملفات المُشتركة المتأثّرة بشكل غير مباشر** (`css/style.css`, `js/main.js`)

### ب) تصنيف المخاطرة

| التصنيف | الوصف | إجراء مطلوب |
|---|---|---|
| 🟢 **منخفض** | تعديل في `<style>` داخلي لصفحة واحدة، أو نص HTML محتوى مرئي في صفحة واحدة، أو إضافة قسم جديد بـ classes فريدة | تعديل مباشر + فحص الصفحة المعدّلة فقط |
| 🟡 **متوسط** | تعديل في `css/style.css` بـ selector محدّد (مثل `.calc-tabs`)، تعديل دالة JS تستخدمها صفحة أو اثنتين | تعديل + فحص الصفحة الأصلية + فحص 1-2 صفحة أخرى تستخدمها |
| 🔴 **عالي** | تعديل CSS variables (`--gold`, `--black-card`...)، تعديل selector عام (`body`, `.section-padding`, `.container`)، تعديل HTML structure مشترك، تعديل JS عام في `main.js` يؤثّر على عدة صفحات | **Backup tag مطلوب قبل التعديل** + فحص شامل 5+ صفحات بعد التعديل |

---

## ✍️ المرحلة 2: قواعد كتابة الكود (Code Hygiene)

### للـ CSS:

✅ **استخدم selectors محدّدة:**
```css
/* جيد */
#testimonials .testi-card { padding: 1rem; }

/* سيء — قد يطبَّق على عناصر غير مقصودة في صفحات أخرى */
.card { padding: 1rem; }
```

✅ **اكتب CSS الخاص بصفحة واحدة داخل `<style>` في رأس الصفحة:**
```html
<head>
  <style>
    /* CSS خاص بهذه الصفحة فقط */
    .my-new-section { ... }
  </style>
</head>
```

✅ **للقسم جديد كبير، استخدم ملف منفصل في `css/sections/`:**
```html
<link rel="stylesheet" href="css/sections/<page>-<section>.css">
```
مثال: `css/sections/home-portfolio-carousel.css` يحتوي CSS كاروسيل البورتفوليو في الصفحة الرئيسية فقط، ولا يُحمَّل في صفحات أخرى.

✅ **أضِف قواعد جديدة بدلاً من حذف القديم:**
```css
/* بدلاً من تعديل .testi-card الموجود */
.testi-card { ... }  /* القديم لم يُمَس */

/* أضِف override خاص بحالتك */
.testi-card.compact-mobile { padding: .5rem; }
```

✅ **استخدم prefix لقسم جديد:**
```css
.c3d-calc-tab { ... }      /* prefix c3d-calc- يحمي من التصادم */
.c3d-pricecard-pill { ... }
```

❌ **لا تُعدّل CSS variables الأساسية:**
- متغيرات مثل `--gold`, `--black-card`, `--diamond-white` تُستخدم في كل مكان
- تعديلها = تغيير شكل الموقع كاملاً

### للـ JavaScript:

✅ **استخدم data-attributes للاستهداف:**
```javascript
/* جيد */
document.querySelectorAll('[data-c3d-component="testi-carousel"]')

/* أقل أماناً — قد تتكرر الـ class في صفحات أخرى */
document.querySelectorAll('.testi-track')
```

✅ **تحقق من وجود العنصر قبل استخدامه:**
```javascript
const el = document.getElementById('myEl');
if (!el) return;  /* تحاشى errors */
```

✅ **استخدم IIFE للنطاق الخاص:**
```javascript
(function(){
  'use strict';
  /* متغيراتك ودوالك محصورة هنا */
})();
```

### للنصوص العربية:

✅ **عدّل دائماً في الملف المحلي ثم ارفع عبر GitHub upload:**
- الـ encoding UTF-8 يُحفظ بشكل سليم

❌ **لا تُعدّل العربية في GitHub web editor:**
- محتمل تلف encoding عند الحفظ
- ✅ راجع [[feedback-github-upload-method]] للطريقة الصحيحة

---

## 🔍 المرحلة 3: مصفوفة الفحص (Verification Matrix)

قبل أي تقرير نجاح، يُتحقَّق من:

### للتعديلات 🟢 المنخفضة:
- [ ] الميزة الجديدة تعمل على الصفحة المعدّلة
- [ ] الميزات القديمة في نفس الصفحة لا تزال تعمل
- [ ] Console بدون errors
- [ ] فحص بصري على ديسكتوب

### للتعديلات 🟡 المتوسطة (إضافةً للسابق):
- [ ] فحص صفحة واحدة على الأقل أخرى تستخدم نفس الـ CSS/JS
- [ ] فحص ديسكتوب + موبايل (إذا كان التعديل بصرياً أو يستخدم media queries)
- [ ] DOM للعناصر المعدّلة سليم
- [ ] CSS rules محمّلة على الموقع الحي (تأكيد عبر `document.styleSheets`)

### للتعديلات 🔴 العالية (إضافةً للسابق):
- [ ] Backup tag مُنشأ قبل التعديل (`pre-<change>-YYYY-MM-DD`)
- [ ] فحص 5+ صفحات مختلفة: `index`, `packages`, `portfolio`, `about`, `contact`, `blog/`
- [ ] Schema/Meta tags لم تتأثّر
- [ ] لقطات قبل/بعد للصفحات الحرجة

---

## 🚀 المرحلة 4: التحقق على الموقع الحي

1. انتظر ~15 ثانية لـ Vercel deploy بعد الـ push
2. افتح الصفحة بـ cache-buster: `?cb=YYYYMMDD-N`
3. تحقّق من:
   - DOM للعناصر المعدّلة موجود
   - CSS rules المُضافة محمّلة فعلاً
   - JS functions محمّلة (إن وُجدت)
   - Console بدون errors
4. للتعديلات البصرية: لقطة شاشة قبل/بعد

---

## ⏪ المرحلة 5: خطة الاستعادة (Rollback Plan)

### قواعد التسمية:
- `pre-<change>-YYYY-MM-DD` = backup قبل تعديل عالي المخاطرة
- `stable-YYYY-MM-DD-<name>` = نسخة مستقرة موثّقة كاملة

### عند ظهور regression:
1. حدّد إن كان السبب آخر تعديل (تحقّق من commits اليوم)
2. للاستعادة الفورية:
   - استرجع `pre-` tag إذا كان مرتبطاً بتعديل معيّن
   - أو استرجع آخر `stable-` tag للحالة الكاملة
3. طُرق الاستعادة:
   - GitHub web: `https://github.com/.../tree/<tag>`
   - تنزيل ZIP: من صفحة الـ Release
   - git: `git checkout <tag>`

---

## 📁 بنية المجلدات الموصى بها

```
.
├── PROTOCOL.md                    ← هذا الملف
├── index.html
├── packages.html
├── about.html
├── ...
├── css/
│   ├── style.css                  ← shared base styles (تُحرَّر بحذر)
│   ├── mobile.css                 ← shared mobile overrides
│   └── sections/                  ← styles خاصة بقسم محدّد
│       ├── README.md
│       ├── home-portfolio-carousel.css
│       ├── home-calc-cards.css
│       └── packages-calc-tabs.css
├── js/
│   └── main.js                    ← shared JS (تُحرَّر بحذر)
└── blog/
    └── *.html                     ← مقالات (مستقلّة عن بعض)
```

---

## 🎯 الخلاصة — قائمة مرجعية لكل تعديل

```
□ صنّفت المخاطرة (🟢/🟡/🔴)
□ حدّدت الملفات المتأثّرة المباشرة وغير المباشرة
□ أنشأت backup tag (إذا 🔴)
□ كتبت الكود بـ selector محدّد أو scoped <style>
□ نصوص عربية: عدّلتها محلياً ثم رفعتها (لا GitHub web)
□ تأكّدت من الفحص حسب مستوى المخاطرة
□ تحقّقت من الموقع الحي بعد Vercel deploy
□ لقطة قبل/بعد (إن كان بصرياً)
```

---

**هذه الآلية مطبَّقة من 2026-05-26 — يجب اتباعها في كل تعديل قادم.**
