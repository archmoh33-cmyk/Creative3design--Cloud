/* ===== C3D Call Gate v3 — الاتصال المباشر (2026-10-31 · قرار المالك) =====
   - يلغي نموذج «اطلب مكالمة» (v2 · 2026-10-06): أي زر/أيقونة اتصال
     (a[data-callback] · a[href="#callback"] · tel:) يتصل مباشرة بـ +201019053288.
   - يُعيد تسمية الأزرار ظاهرياً: «اطلب مكالمة» ⟵ «اتصل بنا» · Request a call ⟵ Call us.
   - GA4: phone_click + تحويل Google Ads «Phone call click» (نفس قيم main.js) مرة واحدة لكل نقرة.
*/
(function () {
  'use strict';
  if (window.__c3dCallGate) return;
  window.__c3dCallGate = true;

  var TEL = 'tel:+201019053288';
  var ADS_CALL = 'AW-10829372232/AAAAAcXo0GY';
  var SEL = 'a[data-callback],a[href="#callback"],a[href^="tel:"]';
  var MAP = [
    [/اطلب مكالمة/g, 'اتصل بنا'],
    [/Request a [Cc]all/g, 'Call us']
  ];

  function rep(s) { for (var i = 0; i < MAP.length; i++) s = s.replace(MAP[i][0], MAP[i][1]); return s; }
  function ev(name, p) { try { if (typeof gtag === 'function') gtag('event', name, p || {}); } catch (e) {} }

  function relabel() {
    var as = document.querySelectorAll(SEL);
    for (var i = 0; i < as.length; i++) {
      var a = as[i];
      if (a.getAttribute('href') !== TEL) a.setAttribute('href', TEL);
      ['aria-label', 'data-ar', 'data-en', 'title'].forEach(function (k) {
        var v = a.getAttribute(k); if (v) { var n = rep(v); if (n !== v) a.setAttribute(k, n); }
      });
      var w = document.createTreeWalker(a, NodeFilter.SHOW_TEXT, null), t;
      while ((t = w.nextNode())) { var n2 = rep(t.nodeValue); if (n2 !== t.nodeValue) t.nodeValue = n2; }
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', relabel); else relabel();

  /* الالتقاط على window يسبق مستمع main.js — نسجّل الحدث هنا مرة واحدة ثم نتصل */
  window.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest(SEL) : null;
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    ev('phone_click', { event_category: 'engagement', link_url: TEL, page_path: location.pathname });
    ev('conversion', { send_to: ADS_CALL, value: 1.0, currency: 'EGP' });
    window.location.href = TEL;
  }, true);
})();
