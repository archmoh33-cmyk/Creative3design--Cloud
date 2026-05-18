/**
 * ============================================================
 *  Creative3Design — Google Ads Conversion Tracking
 *  Campaign: Al Mentor Campaign 2026-06-24
 *  Script version: 1.0 | Date: 2026-05-18
 * ============================================================
 *
 *  كيفية الاستخدام:
 *  1. أنشئ Conversion Actions في Google Ads (واتساب + مكالمة)
 *  2. استبدل الـ Placeholders أدناه بقيمك الحقيقية
 *  3. أضف هذا الملف في كل صفحة بعد gtag الرئيسي
 *
 * ============================================================
 *
 *  ⚠️  IMPORTANT — استبدل هذه القيم بعد إنشاء Conversions في Google Ads:
 *
 *  ADS_CONVERSION_ID      →  مثال: AW-1234567890
 *  WHATSAPP_CONV_LABEL    →  مثال: AbCdEfGhIjKlMnOp
 *  PHONE_CONV_LABEL       →  مثال: QrStUvWxYzAbCdEf
 *
 * ============================================================
 */

;(function () {
  'use strict';

  // ── ⚙️ CONFIG ── استبدل هذه القيم فقط ──────────────────────
  var CONFIG = {
    ADS_CONVERSION_ID   : 'AW-10829372232',          // ✅ Google Ads Conversion ID
    WHATSAPP_CONV_LABEL : 'AAAAAcXorb8',             // ✅ WhatsApp Click (ID: 7615327679)
    PHONE_CONV_LABEL    : 'AAAAAcXo0GY',            // ✅ Phone Call Click (ID: 7615336550)
    GA4_MEASUREMENT_ID  : 'G-BYF05KS3PN',           // ✅ معرف GA4 الموجود
    CAMPAIGN_NAME       : 'al-mentor-june2026',
    DEBUG_MODE          : false                      // true لرؤية logs في Console
  };
  // ─────────────────────────────────────────────────────────────

  var log = CONFIG.DEBUG_MODE
    ? function (msg, data) { console.log('[C3D-Ads] ' + msg, data || ''); }
    : function () {};

  /** ── إطلاق حدث Google Ads Conversion ── */
  function fireAdsConversion(label, value) {
    if (!window.gtag) { log('gtag غير محمّل بعد'); return; }
    if (label.indexOf('LABEL_HERE') !== -1) {
      log('⚠️ Label لم يُعيَّن بعد — تأكد من استبدال CONFIG أعلاه');
      return;
    }
    gtag('event', 'conversion', {
      send_to   : CONFIG.ADS_CONVERSION_ID + '/' + label,
      value     : value || 1.0,
      currency  : 'EGP'
    });
    log('✅ Google Ads conversion fired → ' + label);
  }

  /** ── إطلاق حدث GA4 ── */
  function fireGA4Event(eventName, params) {
    if (!window.gtag) { return; }
    gtag('event', eventName, Object.assign({ campaign: CONFIG.CAMPAIGN_NAME }, params || {}));
    log('✅ GA4 event fired → ' + eventName, params);
  }

  /** ── تتبع نقرة واتساب ── */
  function handleWhatsappClick(e) {
    var source = e.currentTarget.getAttribute('data-tracking-source') || 'generic';
    log('واتساب نُقر من: ' + source);

    // GA4 event (يعمل فوراً حتى قبل إعداد Google Ads)
    fireGA4Event('whatsapp_click', {
      event_category : 'conversion',
      event_label    : 'whatsapp_' + source,
      page_location  : window.location.href
    });

    // Google Ads conversion
    fireAdsConversion(CONFIG.WHATSAPP_CONV_LABEL, 1.0);
  }

  /** ── تتبع نقرة هاتف ── */
  function handlePhoneClick(e) {
    var source = e.currentTarget.getAttribute('data-tracking-source') || 'generic';
    log('هاتف نُقر من: ' + source);

    // GA4 event
    fireGA4Event('phone_call_click', {
      event_category : 'conversion',
      event_label    : 'phone_' + source,
      page_location  : window.location.href
    });

    // Google Ads conversion
    fireAdsConversion(CONFIG.PHONE_CONV_LABEL, 1.0);
  }

  /** ── ربط المستمعين بكل روابط wa.me و tel: ── */
  function attachListeners() {
    // واتساب
    var waLinks = document.querySelectorAll('a[href*="wa.me"], a[href*="whatsapp"]');
    waLinks.forEach(function (el, i) {
      if (!el.dataset.c3dTracked) {
        el.dataset.c3dTracked = '1';
        if (!el.getAttribute('data-tracking-source')) {
          el.setAttribute('data-tracking-source', 'wa_link_' + i);
        }
        el.addEventListener('click', handleWhatsappClick);
      }
    });
    log('WhatsApp links tracked: ' + waLinks.length);

    // هاتف
    var telLinks = document.querySelectorAll('a[href^="tel:"]');
    telLinks.forEach(function (el, i) {
      if (!el.dataset.c3dTracked) {
        el.dataset.c3dTracked = '1';
        if (!el.getAttribute('data-tracking-source')) {
          el.setAttribute('data-tracking-source', 'tel_link_' + i);
        }
        el.addEventListener('click', handlePhoneClick);
      }
    });
    log('Tel links tracked: ' + telLinks.length);
  }

  /** ── تشغيل عند جاهزية DOM ── */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', attachListeners);
  } else {
    attachListeners();
  }

  // ── تصدير للاستخدام اليدوي (مثلاً من كود خارجي) ──────────
  window.C3DAds = {
    fireWhatsapp : function (source) {
      fireGA4Event('whatsapp_click', { event_label: source || 'manual', page_location: window.location.href });
      fireAdsConversion(CONFIG.WHATSAPP_CONV_LABEL, 1.0);
    },
    firePhone : function (source) {
      fireGA4Event('phone_call_click', { event_label: source || 'manual', page_location: window.location.href });
      fireAdsConversion(CONFIG.PHONE_CONV_LABEL, 1.0);
    },
    config : CONFIG
  };

  log('🚀 C3D Ads Tracking initialized | Campaign: ' + CONFIG.CAMPAIGN_NAME);

})(