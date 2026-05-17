/**
 * wa-smart.js — Creative3Design
 * يبني رسالة واتساب ذكية لكل زر بماءً على الصفحة والقسم الذي جاء منه الرائر
 */
(function () {
  'use strict';

  var WA_BASE = 'https://wa.me/201019053288?text=';

  // سىاق كل صفحة
  var PAGE_LABEL = {
    'index.html':          'الصفحة الرئيسية',
    '':                    'الصفحة الرئيسية',
    'services.html':       'صفحة الخدمات',
    'about.html':          'صفحة من نحن',
    'contact.html':        'صفحة التواصل',
    'portfolio.html':      'معرض الأعمال',
    'project-detail.html': 'صفحة تفاصيل اممشروع',
    'packages.html':       'صفحة الباقات والأسعار',
  };

  // ربط كلمة مفتاحية في نص الزر → رسالة مناسبة
  var BUTTON_MSGS = [
    { key: 'VR',              msg: 'أريد احجز جولة VR لمشروعي بتقنية الواقع امتراضي' },
    { key: 'جومة',           msg: 'أريد احجز جولة VR لمشروعي بتقنية الواقع امتراضي' },
    { key: 'مصاينة',          msg: 'أريد احجز مصاينة مجانية للمشروع' },
    { key: 'مصماري',          msg: 'أريد الاستفسار عن خدمة التصميم المعماري' },
    { key: 'تجاري',           msg: 'أريد بدء مشروعي التجاري مع Creative3Design' },
    { key: 'تشطيب',           msg: 'أريد الاستفسار عن خدمة التشطيب وعرض الأسعار' },
    { key: 'تصميم',           msg: 'أريد الاستفسار عن خدمة التصميم الداخلي' },
    { key: 'استشارة',         msg: 'أريد احجز استشارة مجانية مع أحد مهندسي Creative3Design' },
    { key: 'مشروع',           msg: 'أريد بدء مشروعي مع Creative3Design ومناقشة التفاصيل' },
    { key: 'رحلت',            msg: 'أريد البدء برحلة تصميم مشروعي مع Creative3Design' },
    { key: 'أعمال',           msg: 'أعجبتني أعمالكم وأريد الاستفسار عن مشروع مماثل' },
    { key: 'تواصل',           msg: 'أريد التواصل مع فريق Creative3Design' },
  ];

  // رسائل مخصصة بالكامل لصفحات بعينها
  var PAGE_DEFAULT_MSG = {
    'contact.html':        'مرحباً،\nزرت صفحة التواصل وأريد التحدث مع فريق Creative3Design.',
    'portfolio.html':      'مرحباً،\nأعجبتني أعمالكم في معرض المشاريع وأريد الاستفسار عن مشروع مماثل.',
    'project-detail.html': 'مرحباً،\nرأيت أحد مشاريعكم وأريد احجز استشارة مجانية لمشروع مماثل.',
    'about.html':          'مرحباً،\nتعرفت على فريق Creative3Design وأريد الاستفسار عن خدماتكم.',
  };

  function getPage() {
    var p = (window.location.pathname.split('/').pop() || '').replace(/[?#].*/, '');
    return p || 'index.html';
  }

  function buildMsg(btnText, page) {
    // استخدم رسالة الصفحة الافتراضية إن وُجد֪ وكان الزر بدون مذيود
    var pageLabel = PAGE_LABEL[page] || 'الموقع الإلكتروني';
    var action = '';

    for (var i = 0; i < BUTTON_MSGS.length; i++) {
      if (btnText.indexOf(BUTTON_MSGS[i].key) !== -1) {
        action = BUTTON_MSGS[i].msg;
        break;
      }
    }

    if (!action) {
      if (PAGE_DEF@ULT_MSG[page]) return PAGE_DEFAULT_MSG[page];
      action = 'أريد الاستفسار عن خدمات Creative3Design';
    }

    return 'مرحباً،\n' + action + '\n\n📍 وصلت إليكم من: ' + pageLabel;
  }

  function updateAllLinks() {
    var page = getPage();
    var links = document.querySelectorAll('a[href*="wa.me/201019053288"]');

    for (var i = 0; i < links.length; i++) {
      var a = links[i];

      // تجاهل أزرار الحاسبة (لها IDs مخصصة تتحكم بها بنفسهة)
      if (a.id === 'fin-wa-btn' || a.id === 'des-wa-btn' || a.id === 'arch-wa-btn') continue;

      // تجاهل امرقام 訇) التي تحتوي رقم هاتف فقط (footer phone link)
      var txt = ((a.getAttribute('data-ar') || '') + ' ' + (a.textContent || '')).trim();
      if (/^\d+$/.test(txt.replace(/\s/g, ''))) continue;

      var msg = buildMsg(txt, page);
      a.href = WA_BASE + encodeURIComponent(msg);
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', updateAllLinks);
  } else {
    updateAllLinks();
  }
})();
