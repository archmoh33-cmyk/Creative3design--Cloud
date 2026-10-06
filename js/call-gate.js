/* ===== C3D Callback Gate v2 — «اطلب مكالمة» بدل الاتصال المباشر (2026-10-06) =====
   - لا اتصال مباشر من الموقع: كل زر/رابط اتصال (a[data-callback] · a[href="#callback"] · أي tel: متبقٍّ)
     يفتح نموذج «اطلب مكالمة» (الاسم · الموبايل · نوع المشروع · المنطقة · ملاحظة).
   - الطلب يصل على info@creativedesignegypt.com عبر FormSubmit AJAX، والفريق يقرّر مَن يتصل به.
   - الموردون/التسويق: سطر يحوّلهم للإيميل.
   - GA4: callback_open · callback_request (+ form_submit كحدث رئيسي) · تحويل Ads لنموذج التواصل عند الإرسال الناجح فقط.
*/
(function () {
  'use strict';
  if (window.__c3dCallGate) return;
  window.__c3dCallGate = true;

  var EMAIL = 'info@creativedesignegypt.com';
  var ENDPOINT = 'https://formsubmit.co/ajax/' + EMAIL;
  var ADS_FORM = 'AW-10829372232/mPXcCO3D894YEMi27Kso';

  var TXT = {
    ar: {
      title: 'اطلب مكالمة من مهندس', sub: 'سيب بياناتك وهنكلمك في مواعيد العمل (السبت – الخميس، 9 ص – 6 م).',
      name: 'الاسم', phone: 'رقم الموبايل', type: 'نوع المشروع', area: 'المنطقة / المدينة', note: 'تفاصيل مختصرة (اختياري)',
      types: ['شقة', 'فيلا', 'محل / مول تجاري', 'مكتب إداري', 'فندق / منشأة سياحية', 'أخرى'],
      choose: 'اختر…', send: 'اطلب المكالمة', sending: 'جارٍ الإرسال…', cancel: 'إلغاء',
      okT: 'تم استلام طلبك ✓', okB: 'مهندس من فريقنا هيتواصل معاك في أقرب وقت خلال مواعيد العمل.', close: 'تمام',
      err: 'تعذّر الإرسال — جرّب تاني أو راسلنا واتساب.', bad: 'من فضلك اكتب الاسم ورقم موبايل صحيح واختر نوع المشروع.',
      wa: 'أو راسلنا واتساب', vendors: 'موردين / فنيين / عروض تسويق؟ راسلونا على الإيميل فقط:',
      subj: 'طلب مكالمة من الموقع'
    },
    en: {
      title: 'Request a call from an engineer', sub: 'Leave your details and we will call you during working hours (Sat – Thu, 9 am – 6 pm).',
      name: 'Name', phone: 'Mobile number', type: 'Project type', area: 'Area / city', note: 'Short details (optional)',
      types: ['Apartment', 'Villa', 'Shop / mall', 'Office', 'Hotel / hospitality', 'Other'],
      choose: 'Select…', send: 'Request the call', sending: 'Sending…', cancel: 'Cancel',
      okT: 'Request received ✓', okB: 'One of our engineers will call you soon during working hours.', close: 'OK',
      err: 'Could not send — please try again or message us on WhatsApp.', bad: 'Please enter your name, a valid mobile number and the project type.',
      wa: 'Or message us on WhatsApp', vendors: 'Suppliers / contractors / marketing offers? Email only:',
      subj: 'Callback request from website'
    }
  };

  var CSS = '' +
    '.c3dcg-ov{position:fixed;inset:0;z-index:2147483000;background:rgba(8,8,6,.72);display:flex;align-items:flex-end;justify-content:center;opacity:0;transition:opacity .2s ease;font-family:inherit}' +
    '.c3dcg-ov.on{opacity:1}' +
    '.c3dcg-sh{width:100%;max-width:460px;max-height:92vh;overflow:auto;background:#141407;color:#f3efe6;border:1px solid rgba(201,168,76,.35);border-bottom:0;border-radius:18px 18px 0 0;padding:20px 18px calc(16px + env(safe-area-inset-bottom));box-shadow:0 -10px 40px rgba(0,0,0,.5);transform:translateY(24px);transition:transform .22s ease;box-sizing:border-box}' +
    '.c3dcg-ov.on .c3dcg-sh{transform:none}' +
    '@media(min-width:700px){.c3dcg-ov{align-items:center}.c3dcg-sh{border-radius:18px;border-bottom:1px solid rgba(201,168,76,.35)}}' +
    '.c3dcg-h{margin:0 0 4px;font-size:1.15rem;font-weight:700;color:#C9A84C}' +
    '.c3dcg-p{margin:0 0 14px;font-size:.88rem;opacity:.8;line-height:1.6}' +
    '.c3dcg-f label{display:block;font-size:.82rem;margin:0 0 4px;opacity:.85}' +
    '.c3dcg-f input,.c3dcg-f select,.c3dcg-f textarea{display:block;width:100%;box-sizing:border-box;margin:0 0 10px;padding:11px 12px;min-height:46px;background:rgba(255,255,255,.05);color:#f3efe6;border:1px solid rgba(201,168,76,.3);border-radius:10px;font:inherit;font-size:16px}' +
    '.c3dcg-f select option{color:#141407}' +
    '.c3dcg-f textarea{min-height:64px;resize:vertical}' +
    '.c3dcg-f input:focus,.c3dcg-f select:focus,.c3dcg-f textarea:focus{outline:none;border-color:#C9A84C}' +
    '.c3dcg-row{display:flex;gap:10px}.c3dcg-row>div{flex:1;min-width:0}' +
    '.c3dcg-b{display:block;width:100%;min-height:50px;margin:4px 0 8px;padding:12px;background:#C9A84C;color:#141407;border:0;border-radius:12px;font:inherit;font-weight:700;font-size:1rem;cursor:pointer}' +
    '.c3dcg-b:disabled{opacity:.6;cursor:wait}' +
    '.c3dcg-x{display:block;width:100%;padding:8px;background:none;border:0;color:inherit;opacity:.7;font:inherit;cursor:pointer}' +
    '.c3dcg-m{min-height:1.2em;margin:0 0 6px;font-size:.85rem;color:#ff9b8a}' +
    '.c3dcg-l{display:block;text-align:center;margin:4px 0 10px;color:#7ee3a0;font-size:.9rem}' +
    '.c3dcg-v{margin:6px 0 0;padding-top:10px;border-top:1px solid rgba(201,168,76,.18);font-size:.78rem;opacity:.75;line-height:1.6;text-align:center}' +
    '.c3dcg-v a{color:#C9A84C;direction:ltr;unicode-bidi:embed}' +
    '.c3dcg-hp{position:absolute!important;left:-9999px!important;width:1px;height:1px;opacity:0}';

  function lang() {
    var l = (document.documentElement.getAttribute('lang') || '').toLowerCase();
    return (l.indexOf('en') === 0 || /^\/en(\/|$)/.test(location.pathname)) ? 'en' : 'ar';
  }
  function ev(name, p) { try { if (typeof gtag === 'function') gtag('event', name, p || {}); } catch (e) {} }
  function esc(s) { return String(s).replace(/[&<>"]/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]; }); }
  function digits(s) { return String(s || '').replace(/[٠-٩]/g, function (d) { return '٠١٢٣٤٥٦٧٨٩'.indexOf(d); }).replace(/[^\d+]/g, ''); }

  var styled = false, ov = null, lastFocus = null;
  function onKey(e) { if (e.key === 'Escape') close(); }
  function close() {
    if (!ov) return;
    var o = ov; ov = null; o.classList.remove('on');
    document.removeEventListener('keydown', onKey, true);
    setTimeout(function () { if (o.parentNode) o.parentNode.removeChild(o); }, 220);
    if (lastFocus && lastFocus.focus) { try { lastFocus.focus(); } catch (e) {} }
  }

  function formHTML(T) {
    var opts = '<option value="">' + esc(T.choose) + '</option>';
    for (var i = 0; i < T.types.length; i++) opts += '<option>' + esc(T.types[i]) + '</option>';
    return '<h2 class="c3dcg-h" id="c3dcg-h">' + esc(T.title) + '</h2><p class="c3dcg-p">' + esc(T.sub) + '</p>' +
      '<form class="c3dcg-f" novalidate>' +
      '<input class="c3dcg-hp" type="text" name="_honey" tabindex="-1" autocomplete="off" aria-hidden="true">' +
      '<label for="c3dcg-n">' + esc(T.name) + ' *</label><input id="c3dcg-n" name="name" autocomplete="name" required>' +
      '<label for="c3dcg-ph">' + esc(T.phone) + ' *</label><input id="c3dcg-ph" name="phone" type="tel" inputmode="tel" autocomplete="tel" dir="ltr" required>' +
      '<div class="c3dcg-row"><div><label for="c3dcg-t">' + esc(T.type) + ' *</label><select id="c3dcg-t" name="project_type" required>' + opts + '</select></div>' +
      '<div><label for="c3dcg-a">' + esc(T.area) + '</label><input id="c3dcg-a" name="area"></div></div>' +
      '<label for="c3dcg-no">' + esc(T.note) + '</label><textarea id="c3dcg-no" name="note"></textarea>' +
      '<p class="c3dcg-m" role="alert"></p>' +
      '<button class="c3dcg-b" type="submit">' + esc(T.send) + '</button></form>' +
      '<a class="c3dcg-l" href="https://wa.me/201019053288" target="_blank" rel="noopener">' + esc(T.wa) + '</a>' +
      '<button type="button" class="c3dcg-x" data-act="cancel">' + esc(T.cancel) + '</button>' +
      '<p class="c3dcg-v">' + esc(T.vendors) + ' <a href="mailto:' + EMAIL + '">' + EMAIL + '</a></p>';
  }

  function open(btn) {
    if (ov) return;
    if (!styled) { var st = document.createElement('style'); st.id = 'c3dcg-css'; st.textContent = CSS; document.head.appendChild(st); styled = true; }
    var L = lang(), T = TXT[L];
    lastFocus = btn;
    ov = document.createElement('div'); ov.className = 'c3dcg-ov'; ov.setAttribute('dir', L === 'en' ? 'ltr' : 'rtl');
    var sh = document.createElement('div'); sh.className = 'c3dcg-sh';
    sh.setAttribute('role', 'dialog'); sh.setAttribute('aria-modal', 'true'); sh.setAttribute('aria-labelledby', 'c3dcg-h');
    sh.innerHTML = formHTML(T);
    ov.appendChild(sh); document.body.appendChild(ov);
    requestAnimationFrame(function () { if (ov) ov.classList.add('on'); });
    document.addEventListener('keydown', onKey, true);
    var first = sh.querySelector('#c3dcg-n'); if (first) setTimeout(function () { first.focus(); }, 60);
    ev('callback_open', { page_path: location.pathname });

    ov.addEventListener('click', function (e) {
      if (e.target === ov) { close(); return; }
      var b = e.target.closest ? e.target.closest('[data-act]') : null;
      if (b && (b.getAttribute('data-act') === 'cancel' || b.getAttribute('data-act') === 'done')) close();
    });

    var f = sh.querySelector('form');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var msg = f.querySelector('.c3dcg-m'), sb = f.querySelector('button[type=submit]');
      var E = f.elements, name = E['name'].value.trim(), ph = digits(E['phone'].value), type = E['project_type'].value;
      if (E['_honey'].value) { close(); return; }
      if (name.length < 2 || ph.replace(/\D/g, '').length < 8 || !type) { msg.textContent = T.bad; return; }
      msg.textContent = ''; sb.disabled = true; sb.textContent = T.sending;
      var area = E['area'].value.trim();
      var fd = new FormData();
      fd.append('name', name); fd.append('phone', ph); fd.append('project_type', type);
      fd.append('area', area); fd.append('note', E['note'].value.trim());
      fd.append('page', location.href);
      fd.append('_subject', T.subj + ' — ' + type + (area ? ' — ' + area : ''));
      fd.append('_captcha', 'false'); fd.append('_template', 'table');
      fetch(ENDPOINT, { method: 'POST', headers: { 'Accept': 'application/json' }, body: fd })
        .then(function (r) { return r.json(); })
        .then(function (j) {
          if (!(j && (j.success === true || j.success === 'true'))) throw new Error('fs');
          ev('callback_request', { project_type: type, page_path: location.pathname });
          ev('form_submit', { event_category: 'lead', form_source: 'callback:' + location.pathname, page_path: location.pathname });
          ev('conversion', { send_to: ADS_FORM });
          sh.innerHTML = '<h2 class="c3dcg-h" id="c3dcg-h">' + esc(T.okT) + '</h2><p class="c3dcg-p">' + esc(T.okB) + '</p>' +
            '<button type="button" class="c3dcg-b" data-act="done">' + esc(T.close) + '</button>';
          var d = sh.querySelector('[data-act=done]'); if (d) d.focus();
        })
        .catch(function () { msg.textContent = T.err; sb.disabled = false; sb.textContent = T.send; });
    });
  }

  /* الالتقاط على window يسبق مستمع main.js على document — فلا phone_click ولا تحويل اتصال */
  window.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[data-callback],a[href="#callback"],a[href^="tel:"]') : null;
    if (!a) return;
    e.preventDefault(); e.stopPropagation();
    open(a);
  }, true);
})();
