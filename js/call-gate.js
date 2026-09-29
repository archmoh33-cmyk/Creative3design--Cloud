/* ===== C3D Call Gate — شاشة سؤال قبل الاتصال (أيقونة الاتصال العائمة فقط) =====
   - يعترض الضغط على .float-btn-call فقط؛ باقي روابط tel: في الصفحة لا تتأثر.
   - «عميل» ← يتم الاتصال فعلاً (ويُحتسب phone_click + تحويل Ads عبر main.js كالمعتاد).
   - «مورد/فني» و«تسويق/شراكة» ← تحويل للإيميل، بلا اتصال وبلا احتساب تحويل.
   - حدث GA4: call_gate { choice: client | supplier | marketing | dismiss }
   2026-09-29 */
(function () {
  'use strict';
  if (window.__c3dCallGate) return;
  window.__c3dCallGate = true;

  var EMAIL = 'info@creativedesignegypt.com';
  var TXT = {
    ar: {
      title: 'بتتواصل معانا بخصوص إيه؟',
      sub: 'اختيار واحد يوصّلك للشخص المناسب أسرع.',
      client: 'تصميم أو تشطيب مشروع', clientSub: 'شقة · فيلا · تجاري · إداري — اتصال مباشر',
      supplier: 'مورد / فني / مقاول باطن', supplierSub: 'عروض خامات أو تنفيذ',
      marketing: 'عرض تسويق أو شراكة', marketingSub: 'إعلانات · خدمات · تعاون',
      cancel: 'إلغاء',
      doneTitle: 'شكراً لتواصلك',
      doneBody: 'الطلبات دي بيراجعها الفريق المختص عن طريق الإيميل فقط، ابعت عرضك وهنرد عليك لو فيه فرصة مناسبة.',
      mail: 'إرسال إيميل', back: 'رجوع',
      subjSupplier: 'عرض مورد / فني', subjMarketing: 'عرض تسويق / شراكة'
    },
    en: {
      title: 'What is your call about?',
      sub: 'One tap routes you to the right person faster.',
      client: 'Design or finishing project', clientSub: 'Apartment · Villa · Commercial · Office — call now',
      supplier: 'Supplier / contractor', supplierSub: 'Materials or execution offers',
      marketing: 'Marketing or partnership', marketingSub: 'Ads · services · collaboration',
      cancel: 'Cancel',
      doneTitle: 'Thanks for reaching out',
      doneBody: 'These requests are reviewed by email only. Send your offer and we will reply if there is a fit.',
      mail: 'Send email', back: 'Back',
      subjSupplier: 'Supplier / contractor offer', subjMarketing: 'Marketing / partnership offer'
    }
  };

  var CSS = '' +
    '.c3dcg-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(8,8,6,.72);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s ease;font-family:inherit}' +
    '.c3dcg-ov.on{opacity:1}' +
    '.c3dcg-sh{width:100%;max-width:440px;background:#141407;color:#f3efe6;border:1px solid rgba(201,168,76,.35);border-bottom:0;border-radius:18px 18px 0 0;padding:22px 18px calc(18px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.5);transform:translateY(24px);transition:transform .22s ease;box-sizing:border-box}' +
    '.c3dcg-ov.on .c3dcg-sh{transform:none}' +
    '@media(min-width:700px){.c3dcg-ov{align-items:center}.c3dcg-sh{border-radius:18px;border-bottom:1px solid rgba(201,168,76,.35)}}' +
    '.c3dcg-h{margin:0 0 4px;font-size:1.15rem;font-weight:700;color:#C9A84C}' +
    '.c3dcg-p{margin:0 0 16px;font-size:.9rem;opacity:.8;line-height:1.6}' +
    '.c3dcg-o{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;margin:0 0 10px;padding:12px 14px;background:rgba(255,255,255,.04);color:inherit;border:1px solid rgba(201,168,76,.25);border-radius:12px;cursor:pointer;font:inherit;text-align:start;box-sizing:border-box;text-decoration:none}' +
    '.c3dcg-o:hover,.c3dcg-o:focus-visible{border-color:#C9A84C;background:rgba(201,168,76,.10);outline:none}' +
    '.c3dcg-o.pri{background:#C9A84C;color:#141407;border-color:#C9A84C}' +
    '.c3dcg-o.pri:hover,.c3dcg-o.pri:focus-visible{background:#d8b95c}' +
    '.c3dcg-i{font-size:1.4rem;line-height:1;flex:0 0 auto}' +
    '.c3dcg-t{display:block;font-weight:700;font-size:.98rem}' +
    '.c3dcg-s{display:block;font-size:.8rem;opacity:.75;margin-top:2px}' +
    '.c3dcg-x{display:block;width:100%;margin-top:4px;padding:10px;background:none;border:0;color:inherit;opacity:.7;font:inherit;cursor:pointer}' +
    '.c3dcg-x:hover{opacity:1}' +
    '.c3dcg-m{display:block;margin:0 0 14px;font-size:.9rem;color:#C9A84C;direction:ltr;text-align:center;word-break:break-all}';

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    if (l.indexOf('en') === 0 || /^\/en(\/|$)/.test(location.pathname)) return 'en';
    return 'ar';
  }
  function track(choice) {
    try { if (typeof gtag === 'function') gtag('event', 'call_gate', { choice: choice, page_path: location.pathname }); } catch (e) {}
  }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }

  var styled = false, ov = null, lastFocus = null;

  function close(choice) {
    if (!ov) return;
    if (choice) track(choice);
    var o = ov; ov = null;
    o.classList.remove('on');
    document.removeEventListener('keydown', onKey, true);
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 220);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }
  function onKey(e) { if (e.key === 'Escape') close('dismiss'); }

  function opt(cls, icon, t, s, act) {
    return '<button type="button" class="c3dcg-o ' + cls + '" data-act="' + act + '"><span class="c3dcg-i" aria-hidden="true">' + icon +
      '</span><span><span class="c3dcg-t">' + esc(t) + '</span><span class="c3dcg-s">' + esc(s) + '</span></span></button>';
  }

  function renderMain(sh, T) {
    sh.innerHTML = '<h2 class="c3dcg-h" id="c3dcg-h">' + esc(T.title) + '</h2><p class="c3dcg-p">' + esc(T.sub) + '</p>' +
      opt('pri', '🏠', T.client, T.clientSub, 'client') +
      opt('', '🔧', T.supplier, T.supplierSub, 'supplier') +
      opt('', '📢', T.marketing, T.marketingSub, 'marketing') +
      '<button type="button" class="c3dcg-x" data-act="cancel">' + esc(T.cancel) + '</button>';
    var f = sh.querySelector('[data-act="client"]'); if (f) f.focus();
  }
  function renderEmail(sh, T, subj) {
    var href = 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subj);
    sh.innerHTML = '<h2 class="c3dcg-h" id="c3dcg-h">' + esc(T.doneTitle) + '</h2><p class="c3dcg-p">' + esc(T.doneBody) + '</p>' +
      '<span class="c3dcg-m">' + EMAIL + '</span>' +
      '<a class="c3dcg-o pri" data-act="mail" href="' + href + '"><span class="c3dcg-i" aria-hidden="true">✉️</span><span><span class="c3dcg-t">' + esc(T.mail) + '</span></span></a>' +
      '<button type="button" class="c3dcg-x" data-act="back">' + esc(T.back) + '</button>';
    var f = sh.querySelector('[data-act="mail"]'); if (f) f.focus();
  }

  function open(telHref, btn) {
    if (ov) return;
    if (!styled) { var st = document.createElement('style'); st.id = 'c3dcg-css'; st.textContent = CSS; document.head.appendChild(st); styled = true; }
    var L = lang(), T = TXT[L];
    lastFocus = btn;
    ov = document.createElement('div');
    ov.className = 'c3dcg-ov';
    ov.setAttribute('dir', L === 'en' ? 'ltr' : 'rtl');
    var sh = document.createElement('div');
    sh.className = 'c3dcg-sh';
    sh.setAttribute('role', 'dialog');
    sh.setAttribute('aria-modal', 'true');
    sh.setAttribute('aria-labelledby', 'c3dcg-h');
    ov.appendChild(sh);
    document.body.appendChild(ov);
    renderMain(sh, T);
    requestAnimationFrame(function () { if (ov) ov.classList.add('on'); });
    document.addEventListener('keydown', onKey, true);

    ov.addEventListener('click', function (e) {
      if (e.target === ov) { close('dismiss'); return; }
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (!b) return;
      var act = b.getAttribute('data-act');
      if (act === 'client') {
        track('client');
        /* رابط tel: عادي خارج الأيقونة العائمة → يمر على تتبّع main.js (phone_click + تحويل Ads) ثم يتصل */
        var a = document.createElement('a');
        a.href = telHref; a.style.display = 'none';
        document.body.appendChild(a);
        close();
        a.click();
        setTimeout(function () { if (a.parentNode) a.parentNode.removeChild(a); }, 1000);
      } else if (act === 'supplier') {
        track('supplier'); renderEmail(sh, T, T.subjSupplier);
      } else if (act === 'marketing') {
        track('marketing'); renderEmail(sh, T, T.subjMarketing);
      } else if (act === 'back') {
        renderMain(sh, T);
      } else if (act === 'cancel') {
        close('dismiss');
      } else if (act === 'mail') {
        setTimeout(function () { close(); }, 300);
      }
    });
  }

  /* الالتقاط على window يسبق مستمع main.js على document — فلا يُحتسب تحويل قبل الاختيار */
  window.addEventListener('click', function (e) {
    var btn = e.target && e.target.closest ? e.target.closest('a.float-btn-call[href^="tel:"]') : null;
    if (!btn) return;
    e.preventDefault();
    e.stopPropagation();
    open(btn.getAttribute('href'), btn);
  }, true);
})();
