/* ================================================================
   Creative3Design — Shared JavaScript v3.0
   مكتب تصميم داخلي واستشاري معتمد | القاهرة
================================================================ */
'use strict';

/* ── LANGUAGE ── */
const LANG_KEY = 'c3d_lang';
let currentLang = localStorage.getItem(LANG_KEY) || 'ar';

function setLang(lang) {
  currentLang = lang;
  localStorage.setItem(LANG_KEY, lang);
  const html = document.getElementById('html-root') || document.documentElement;
  html.lang = lang;
  html.dir = lang === 'en' ? 'ltr' : 'rtl';
  document.querySelectorAll('[data-ar][data-en]').forEach(el => {
    const val = el.dataset[lang];
    if (val !== undefined) el.textContent = val;
  });
  // Handle placeholders for inputs
  document.querySelectorAll('[data-ar-placeholder][data-en-placeholder]').forEach(el => {
    el.placeholder = lang === 'ar' ? el.dataset.arPlaceholder : el.dataset.enPlaceholder;
  });
  // Handle page title
  const titleAr = document.documentElement.dataset.titleAr;
  const titleEn = document.documentElement.dataset.titleEn;
  if (titleAr && titleEn) document.title = lang === 'ar' ? titleAr : titleEn;
  const btn = document.getElementById('langToggle');
  if (btn) btn.textContent = lang === 'ar' ? 'EN' : 'عربي';
  // sync hero mobile header lang button
  const heroBtn = document.getElementById('heroLangToggle');
  if (heroBtn) heroBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';
  // sync desktop navbar lang button (hero pages)
  const navbarBtn = document.getElementById('navbarLangBtn');
  if (navbarBtn) navbarBtn.textContent = lang === 'ar' ? 'EN' : 'عربي';
}

function toggleLang() {
  setLang(currentLang === 'ar' ? 'en' : 'ar');
}

/* ── NAVBAR ── */
function initNavbar() {
  const navbar = document.getElementById('navbar');
  if (!navbar) return;
  const isHeroPage = document.body.classList.contains('page-has-hero');
  const threshold = isHeroPage ? (window.innerHeight * 0.80) : 60;

  // Hero pages: top-bar (with lang toggle) is hidden → inject lang button into desktop navbar
  if (isHeroPage && window.innerWidth > 768) {
    const inner = navbar.querySelector('.navbar-inner');
    if (inner && !inner.querySelector('#navbarLangBtn')) {
      const langBtn = document.createElement('button');
      langBtn.id = 'navbarLangBtn';
      langBtn.className = 'navbar-lang-btn';
      langBtn.onclick = toggleLang;
      langBtn.textContent = currentLang === 'ar' ? 'EN' : 'عربي';
      inner.appendChild(langBtn);
    }
  }

  function onScroll() {
    navbar.classList.toggle('scrolled', window.scrollY > threshold);
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll(); // run on init
}

function toggleNav() {
  const links = document.getElementById('navLinks');
  const hb = document.getElementById('hamburger');
  const heroHb = document.getElementById('heroHamburger');
  const overlay = document.getElementById('navOverlay');
  if (!links) return;
  const open = links.classList.toggle('open');
  if (hb) hb.classList.toggle('open', open);
  if (heroHb) heroHb.classList.toggle('open', open);
  if (overlay) overlay.classList.toggle('open', open);
  document.body.style.overflow = open ? 'hidden' : '';
}

/* ── HERO SLIDER ── */
let heroIndex = 0;
let heroTimer = null;

function goToSlide(idx) {
  const slides = document.querySelectorAll('.hero-slide');
  const dots = document.querySelectorAll('.hero-dot');
  if (!slides.length) return;
  slides[heroIndex].classList.remove('active');
  if (dots[heroIndex]) dots[heroIndex].classList.remove('active');
  heroIndex = (idx + slides.length) % slides.length;
  /* Lazy load: حمّل صورة الخلفية أول مرة يُعرض فيها السلايد */
  const target = slides[heroIndex];
  if (target.dataset.bg) {
    target.style.backgroundImage = "url('" + target.dataset.bg + "')";
    target.removeAttribute('data-bg');
  }
  target.classList.add('active');
  if (dots[heroIndex]) dots[heroIndex].classList.add('active');
  /* تحديث النص المشترك من بيانات الـ slide النشط */
  const shared = document.getElementById('heroContent');
  if (shared) {
    const data = target.querySelector('.hsd');
    if (data) {
      shared.innerHTML = data.innerHTML;
      /* ضمان وجود H1 واحد دائماً: العنوان داخل الهيرو المشترك يبقى <h1> */
      const hd = shared.querySelector('h1, h2, h3');
      if (hd && hd.tagName !== 'H1') {
        const h1el = document.createElement('h1');
        for (let i = 0; i < hd.attributes.length; i++) {
          h1el.setAttribute(hd.attributes[i].name, hd.attributes[i].value);
        }
        h1el.innerHTML = hd.innerHTML;
        hd.replaceWith(h1el);
      }
      /* إعادة تطبيق اللغة الحالية على المحتوى الجديد */
      const lang = document.documentElement.lang;
      shared.querySelectorAll('[data-ar]').forEach(function(el) {
        if (lang !== 'en') el.textContent = el.getAttribute('data-ar');
      });
    }
  }
}

function initHeroSlider() {
  const slides = document.querySelectorAll('.hero-slide');
  if (slides.length < 2) return;
  heroTimer = setInterval(() => goToSlide(heroIndex + 1), 5500);
}

/* ── ANIMATED COUNTERS ── */
function animateCounter(el) {
  const target = parseInt(el.dataset.target, 10);
  const duration = 2000;
  const steps = 60;
  const interval = duration / steps;
  let step = 0;
  const timer = setInterval(function() {
    step++;
    const progress = Math.min(step / steps, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(ease * target);
    if (step >= steps) {
      clearInterval(timer);
      el.textContent = target;
    }
  }, interval);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting && !e.target.dataset.done) {
        e.target.dataset.done = '1';
        animateCounter(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 80px 0px' });
  counters.forEach(c => obs.observe(c));
}

/* ── LAZY REVEAL ── */
function initLazyReveal() {
  const sel = '.lazy-reveal, .lazy-reveal-left';
  /* Reveal elements already in or near the viewport */
  function revealVisible() {
    document.querySelectorAll(sel + ':not(.revealed)').forEach(el => {
      if (el.getBoundingClientRect().top < window.innerHeight + 120) {
        el.classList.add('revealed');
      }
    });
  }
  /* Run immediately, then again after layout settles (hero loads from Supabase async) */
  revealVisible();
  setTimeout(revealVisible, 400);
  setTimeout(revealVisible, 1000);
  /* IntersectionObserver for below-fold elements — triggers as soon as edge enters view */
  const els = document.querySelectorAll(sel);
  if (!els.length) return;
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('revealed');
        obs.unobserve(e.target);
      }
    });
  }, { threshold: 0, rootMargin: '0px 0px 60px 0px' });
  els.forEach(el => obs.observe(el));
}

/* ── LAZY IMAGES ── */
function initLazyImages() {
  const imgs = document.querySelectorAll('.lazy-img[data-src]');
  if (!imgs.length) return;
  if ('IntersectionObserver' in window) {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          const img = e.target;
          if (img.dataset.src) img.src = img.dataset.src;
          img.removeAttribute('data-src');
          obs.unobserve(img);
        }
      });
    }, { rootMargin: '200px' });
    imgs.forEach(img => obs.observe(img));
  } else {
    imgs.forEach(img => { img.src = img.dataset.src; });
  }
}

/* ── BEFORE / AFTER ── */
function switchBA(idx) {
  const thumbs = document.querySelectorAll('.ba-thumb');
  thumbs.forEach((t, i) => t.classList.toggle('active', i === idx));
  const before = document.getElementById('ba-before');
  const after  = document.getElementById('ba-after');
  if (!before || !after) return;
  /* Use dynamic Supabase data when available */
  const items = window.__baItems;
  if (items && items[idx]) {
    if (items[idx].before_url) before.src = items[idx].before_url;
    if (items[idx].after_url)  after.src  = items[idx].after_url;
  }
  const divider = document.getElementById('ba-divider');
  if (divider) {
    divider.style.left = '50%';
    updateAfterClip(50);
  }
}

function updateAfterClip(pct) {
  const after = document.getElementById('ba-after');
  if (after) after.style.clipPath = `inset(0 ${100 - pct}% 0 0)`;
}

function initBeforeAfter() {
  const wrap = document.getElementById('ba-wrap');
  const divider = document.getElementById('ba-divider');
  if (!wrap || !divider) return;

  let dragging = false;

  function move(x) {
    const rect = wrap.getBoundingClientRect();
    let pct = ((x - rect.left) / rect.width) * 100;
    pct = Math.min(Math.max(pct, 2), 98);
    divider.style.left = pct + '%';
    updateAfterClip(pct);
  }

  /* Set initial position at 50% */
  divider.style.left = '50%';
  updateAfterClip(50);

  divider.addEventListener('mousedown', e => { dragging = true; e.preventDefault(); });
  window.addEventListener('mousemove', e => { if (dragging) move(e.clientX); });
  window.addEventListener('mouseup',   () => { dragging = false; });

  divider.addEventListener('touchstart', e => { dragging = true; }, { passive: true });
  window.addEventListener('touchmove',   e => {
    if (dragging) move(e.touches[0].clientX);
  }, { passive: true });
  window.addEventListener('touchend',    () => { dragging = false; });
}

/* ── VIDEO SLIDER ── */
let videoIdx = 0;
function getVideoVisibleCount() {
  if (window.innerWidth < 640) return 1;
  if (window.innerWidth < 900) return 2;
  return 3;
}

function videoSlideUpdate() {
  const track = document.getElementById('videoTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.video-card');
  const visible = getVideoVisibleCount();
  const maxIdx = Math.max(0, cards.length - visible);
  videoIdx = Math.min(videoIdx, maxIdx);
  const cardWidth = track.parentElement.offsetWidth / visible;
  track.style.transform = `translateX(${videoIdx * cardWidth}px)`;
}

function videoNext() { videoIdx = Math.max(0, videoIdx - 1); videoSlideUpdate(); }
function videoPrev() {
  const track = document.getElementById('videoTrack');
  if (!track) return;
  const max = Math.max(0, track.querySelectorAll('.video-card').length - getVideoVisibleCount());
  videoIdx = Math.min(videoIdx + 1, max);
  initCompoundsMarquee();
  initMobileDrawer();
  videoSlideUpdate();
}

/* ── TESTIMONIALS ── */
let testiIdx = 0;
function getTestiVisible() {
  return window.innerWidth < 900 ? 1 : 2;
}

function testiUpdate() {
  const track = document.getElementById('testiTrack');
  if (!track) return;
  const cards = track.querySelectorAll('.testi-card');
  if (!cards.length) return;
  const visible = getTestiVisible();
  const max = Math.max(0, cards.length - visible);
  testiIdx = Math.min(testiIdx, max);
  /* Use the actual rendered card width + gap for accurate sliding —
     this avoids miscalculation when card box-sizing or container width differs */
  const trackStyle = getComputedStyle(track);
  const gap = parseFloat(trackStyle.gap) || 0;
  const cardW = cards[0].offsetWidth + gap;
  track.style.transform = `translateX(${testiIdx * cardW}px)`;
}

function testiNext() { testiIdx = Math.max(0, testiIdx - 1); testiUpdate(); }
function testiPrev() {
  const track = document.getElementById('testiTrack');
  if (!track) return;
  const max = Math.max(0, track.querySelectorAll('.testi-card').length - getTestiVisible());
  testiIdx = Math.min(testiIdx + 1, max);
  testiUpdate();
}

/* ── PORTFOLIO FILTER ── */
const MAX_PORTFOLIO = 10; // عدد الصور لكل تصنيف محدد
// كوتا مخصصة لكل فئة في وضع "الكل" بالصفحة الرئيسية
const CAT_QUOTA_HOME = {'interior-res':4,'interior-com':2,'villa':2,'hospitality':2,'commercial':2};

function applyPortfolioFilter(cat, cards, limit) {
  const maxAll = limit || MAX_PORTFOLIO;              // حد الكل
  const perCat = Math.ceil(maxAll / 5);               // عدد كروت لكل قسم في "الكل"
  if (cat === 'all') {
    // استخدام الكوتا المخصصة إن وُجدت، وإلا perCat
    const seen = {};
    cards.forEach(card => {
      const c = card.dataset.cat;
      if (!seen[c]) seen[c] = 0;
      const quota = CAT_QUOTA_HOME[c] !== undefined ? CAT_QUOTA_HOME[c] : perCat;
      const show = seen[c] < quota;
      if (show) seen[c]++;
      card.classList.toggle('hidden', !show);
      if (show && !card.classList.contains('revealed')) {
        card.classList.add('lazy-reveal');
        setTimeout(() => card.classList.add('revealed'), 50);
      }
    });
  } else {
    let shown = 0;
    cards.forEach(card => {
      const matches = card.dataset.cat === cat;
      const show = matches && shown < maxAll;
      if (matches && shown < maxAll) shown++;
      card.classList.toggle('hidden', !show);
      if (show && !card.classList.contains('revealed')) {
        card.classList.add('lazy-reveal');
        setTimeout(() => card.classList.add('revealed'), 50);
      }
    });
  }
}

function initPortfolioFilter() {
  // Skip on portfolio.html — that page manages its own Supabase-based filter
  if (window.C3D_PORTFOLIO_PAGE) return;
  const filterEl = document.getElementById('portfolioFilter');
  if (!filterEl) return;
  const btns = filterEl.querySelectorAll('.filter-btn');
  if (!btns.length) return;

  let staticCat   = 'all';
  let staticLimit = 10; // الـ limit للكروت الثابتة (static fallback)

  function applyStatic(cat, limit) {
    staticCat   = cat;
    staticLimit = limit;
    const cards = document.querySelectorAll('#portfolioGrid .port-card');
    applyPortfolioFilter(cat, cards, limit);
    // زر شاهد المزيد للـ static
    const wrap = document.getElementById('showMoreWrap');
    const moreBtn = document.getElementById('portfolioShowMore');
    if (wrap && moreBtn) {
      const total = cat === 'all'
        ? document.querySelectorAll('#portfolioGrid .port-card').length
        : document.querySelectorAll('#portfolioGrid .port-card[data-cat="' + cat + '"]').length;
      if (limit < 18 && total > limit) {
        wrap.style.display = 'block';
      } else {
        wrap.style.display = 'none';
      }
    }
  }

  // تطبيق الفلتر الأولي بالكروت الموجودة حالياً في الـ grid
  applyStatic('all', 10);

  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      applyStatic(btn.dataset.cat || 'all', 10);
    });
  });

  // زر "شاهد المزيد" للـ static fallback
  const showMoreBtn = document.getElementById('portfolioShowMore');
  if (showMoreBtn) {
    showMoreBtn.addEventListener('click', () => {
      applyStatic(staticCat, 18);
    });
  }
}

// يُستدعى بعد تحميل كروت Supabase في الصفحة الرئيسية
window.c3dReloadHomepageFilter = function() {
  const activeBtn = document.querySelector('#portfolioFilter .filter-btn.active');
  const activeCat = activeBtn ? (activeBtn.dataset.cat || 'all') : 'all';
  const cards = document.querySelectorAll('#portfolioGrid .port-card');
  applyPortfolioFilter(activeCat, cards);
};

/* ── VIDEO LIGHTBOX ── */
let savedScrollY = 0;

function openYT(videoId) {
  savedScrollY = window.scrollY;
  const lb = document.getElementById('videoLightbox');
  const frame = document.getElementById('ytFrame');
  if (!lb || !frame) return;
  frame.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`;
  lb.classList.add('open');
  document.body.style.overflow = 'hidden';
  history.pushState({ c3dVideoLb: true }, '');
}

function closeLightbox(e) {
  if (e && e.target !== document.getElementById('videoLightbox') && !e.target.classList.contains('lightbox-close') && !e.target.closest('.lightbox-close')) return;
  const lb = document.getElementById('videoLightbox');
  const frame = document.getElementById('ytFrame');
  if (!lb) return;
  lb.classList.remove('open');
  if (frame) { frame.src = ''; }
  document.body.style.overflow = '';
  window.scrollTo({ top: savedScrollY, behavior: 'instant' });
  if (history.state && history.state.c3dVideoLb) history.back();
}

window.addEventListener('popstate', function(e) {
  const lb = document.getElementById('videoLightbox');
  if (lb && lb.classList.contains('open')) {
    lb.classList.remove('open');
    const frame = document.getElementById('ytFrame');
    if (frame) frame.src = '';
    document.body.style.overflow = '';
    window.scrollTo({ top: savedScrollY, behavior: 'instant' });
  }
});

document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    const lb = document.getElementById('videoLightbox');
    if (lb && lb.classList.contains('open')) closeLightbox({ target: lb });
    const nav = document.getElementById('navLinks');
    if (nav && nav.classList.contains('open')) toggleNav();
  }
});

/* ── BACK TO TOP ── */
function initBackToTop() {
  const btn = document.getElementById('backToTop');
  if (!btn) return;
  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  }, { passive: true });
}

/* ── CALCULATOR ── */
function initCalculator() {
  const slider = document.getElementById('areaSlider');
  const areaDisplay = document.getElementById('areaDisplay');
  if (!slider) return;

  const rates = { Economy: 1200, Standard: 1800, Premium: 2800, Luxury: 4500 };

  function updateCalc() {
    const area = parseInt(slider.value, 10);
    if (areaDisplay) areaDisplay.textContent = area;
    Object.keys(rates).forEach(pkg => {
      const el = document.getElementById(`pkg-${pkg.toLowerCase()}-total`);
      if (el) el.textContent = (area * rates[pkg]).toLocaleString('ar-EG') + ' ج.م';
    });
  }

  slider.addEventListener('input', updateCalc);

  document.querySelectorAll('.unit-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.unit-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const unit = btn.dataset.unit;
      const maxMap = { meter: 1000, feet: 10000 };
      const unitLabel = btn.dataset.label || unit;
      slider.max = maxMap[unit] || 1000;
      updateCalc();
    });
  });

  updateCalc();
}


/* ── COMPOUNDS MARQUEE (mobile) ── */
function initCompoundsMarquee() {
  const grid = document.querySelector('.compounds-section .compounds-grid');
  if (!grid || grid.dataset.marqueeInit) return;
  grid.dataset.marqueeInit = '1';

  // Build marquee wrapper
  const wrap = document.createElement('div');
  wrap.className = 'compounds-marquee-wrap';

  const track = document.createElement('div');
  track.className = 'compounds-marquee-track';

  // Clone badges THREE times for perfectly seamless infinite loop
  const badges = Array.from(grid.querySelectorAll('.compound-badge'));
  badges.forEach(b => track.appendChild(b.cloneNode(true)));
  badges.forEach(b => track.appendChild(b.cloneNode(true)));
  badges.forEach(b => track.appendChild(b.cloneNode(true)));

  wrap.appendChild(track);

  // Insert wrapper before grid, hide original
  grid.parentNode.insertBefore(wrap, grid);
  grid.classList.add('marquee-hidden');
}


/* ── MOBILE DRAWER — رأس وذيل الـ Drawer ── */
/* ── MOBILE HEADER BAR (موبايل فقط — يظهر فوق الهيرو) ── */
function initMobileHeader() {
  if (window.innerWidth > 768) return;
  if (document.getElementById('heroMobileHeader')) return;

  // تحديد مسار الرابط بناءً على موقع الصفحة
  const depth = window.location.pathname.split('/').filter(Boolean).length;
  const base  = depth > 1 ? '../' : '';

  const bar = document.createElement('div');
  bar.id = 'heroMobileHeader';
  bar.className = 'hero-mobile-header';

  // z-index:1001 — أعلى من الـ navbar (عادةً 1000) لمنع التداخل
  // الترتيب: [☰ | EN] — أقصى اليسار | Creative3Design — المنتصف | C3D — أقصى اليمين
  bar.style.cssText = [
    'position:fixed',
    'top:0',
    'left:0',
    'right:0',
    'z-index:1001',
    'height:56px',
    'display:flex',
    'align-items:center',
    'pointer-events:auto',
    'background:linear-gradient(to bottom,rgba(10,8,6,.92) 0%,rgba(10,8,6,.55) 70%,transparent 100%)'
  ].join(';');

  bar.innerHTML = `
    <button class="hero-hamburger" id="heroHamburger" aria-label="القائمة" onclick="toggleNav()"
      style="position:absolute;left:1rem;top:50%;transform:translateY(-50%);display:flex;flex-direction:column;justify-content:center;align-items:center;gap:5px;width:40px;height:38px;padding:.45rem;background:rgba(255,255,255,.07);border:1px solid rgba(184,151,106,.35);border-radius:7px;cursor:pointer;z-index:2;">
      <span style="display:block;width:18px;height:2px;background:#e8e8e8;border-radius:2px;transition:all .3s;"></span>
      <span style="display:block;width:18px;height:2px;background:#e8e8e8;border-radius:2px;transition:all .3s;"></span>
      <span style="display:block;width:18px;height:2px;background:#e8e8e8;border-radius:2px;transition:all .3s;"></span>
    </button>
    <button class="hero-lang-btn" id="heroLangToggle" onclick="toggleLang()"
      style="position:absolute;left:calc(1rem + 48px);top:50%;transform:translateY(-50%);display:flex;align-items:center;justify-content:center;min-width:46px;height:36px;padding:0 .6rem;border:1.5px solid rgba(184,151,106,.55);border-radius:7px;background:rgba(184,151,106,.13);color:#b8976a;font-size:.82rem;font-weight:800;font-family:'Cairo',sans-serif;cursor:pointer;z-index:2;">
      ${currentLang === 'ar' ? 'EN' : 'عربي'}
    </button>
    <a href="${base}index.html" class="hero-mobile-logo"
      style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-family:'Cairo',sans-serif;font-size:.9rem;font-weight:900;color:#f5f5f5;letter-spacing:.03em;text-decoration:none;white-space:nowrap;pointer-events:auto;z-index:1;">
      Creative<span style="color:#b8976a;">3</span>Design
    </a>
    <a href="${base}index.html"
      style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-family:'Cairo',sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.08em;text-decoration:none;white-space:nowrap;pointer-events:auto;z-index:2;line-height:1;display:flex;flex-direction:row;align-items:baseline;gap:0;direction:ltr;unicode-bidi:bidi-override;">
      <span style="color:#b8976a;">C3</span><span style="color:#f0f0f0;">D</span>
    </a>
  `;

  document.body.insertBefore(bar, document.body.firstChild);

  // إخفاء شعار الـ navbar + الهامبرغر الأصلي على موبايل — يُستعاض عنهما بـ heroMobileHeader
  const navLogo = document.querySelector('.nav-logo');
  if (navLogo) { navLogo.style.visibility = 'hidden'; navLogo.style.pointerEvents = 'none'; }
  const navHamburger = document.getElementById('hamburger');
  if (navHamburger) { navHamburger.style.visibility = 'hidden'; navHamburger.style.pointerEvents = 'none'; }
}

function initMobileDrawer() {
  if (window.innerWidth > 768) return;
  const nav = document.getElementById('navLinks');
  if (!nav || nav.dataset.drawerInit) return;
  nav.dataset.drawerInit = '1';

  // Move nav to body level — .navbar { display:none } hides all children
  // including position:fixed descendants. Moving to body fixes the drawer.
  document.body.appendChild(nav);

  // ── رأس الـ Drawer ──
  const head = document.createElement('div');
  head.className = 'drawer-head';
  head.innerHTML = `
    <div class="drawer-logo">Creative<span>3</span>Design</div>
    <button class="drawer-close" onclick="toggleNav()" aria-label="إغلاق القائمة">✕</button>
  `;
  nav.insertBefore(head, nav.firstChild);

  // ── أيقونات الروابط ──
  const icons = {
    'index.html'      : '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/></svg>',
    'about.html'      : '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="8" r="4"/><path d="M4 20c0-4 3.6-7 8-7s8 3 8 7"/></svg>',
    'services.html'   : '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>',
    'packages.html'   : '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>',
    'portfolio.html'  : '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>',
    'blog/index.html' : '<svg class="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
  };
  nav.querySelectorAll('li a:not(.nav-cta)').forEach(a => {
    const href = a.getAttribute('href');
    const key = Object.keys(icons).find(k => href && href.includes(k));
    if (key) a.insertAdjacentHTML('afterbegin', icons[key]);
  });

  // ── ذيل الـ Drawer: زر اللغة + واتساب ──
  const footer = document.createElement('div');
  footer.className = 'drawer-footer';

  const currentLangLabel = (typeof currentLang !== 'undefined' && currentLang === 'ar') ? 'English' : 'العربية';
  footer.innerHTML = `
    <button class="drawer-lang-btn" id="drawerLangBtn" onclick="toggleLang(); updateDrawerLang();">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>
      <span id="drawerLangLabel">${currentLangLabel}</span>
    </button>
    <a href="https://wa.me/201019053288" target="_blank" rel="noopener" class="drawer-wa-btn" onclick="toggleNav()">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
      واتساب — تواصل معنا
    </a>
  `;
  nav.appendChild(footer);

  // تحديد الصفحة الحالية
  const currentPage = window.location.pathname.split('/').pop() || 'index.html';
  nav.querySelectorAll('li a').forEach(a => {
    if (a.getAttribute('href') === currentPage) a.classList.add('active-page');
  });
}

function updateDrawerLang() {
  const lbl = document.getElementById('drawerLangLabel');
  const topBtn = document.getElementById('langToggle');
  if (lbl && topBtn) lbl.textContent = topBtn.textContent.trim() === 'EN' ? 'English' : 'العربية';
}

/* ── INIT ── */
document.addEventListener('DOMContentLoaded', () => {
  setLang(currentLang);
  initNavbar();
  initHeroSlider();
  initCounters();
  initLazyReveal();
  initLazyImages();
  initBeforeAfter();
  initBackToTop();
  initCalculator();
  initCompoundsMarquee();
  initMobileHeader();
  initMobileDrawer();
  initPortfolioFilter();
  videoSlideUpdate();
  testiUpdate();
  /* Lazy load Google Maps — تحميل الخريطة عند الاقتراب منها فقط */
  (function() {
    var mapFrame = document.getElementById('mapFrame');
    if (!mapFrame || !mapFrame.dataset.src) return;
    if ('IntersectionObserver' in window) {
      var obs = new IntersectionObserver(function(entries) {
        if (entries[0].isIntersecting) {
          mapFrame.src = mapFrame.dataset.src;
          obs.unobserve(mapFrame);
        }
      }, { rootMargin: '300px' });
      obs.observe(mapFrame);
    } else {
      mapFrame.src = mapFrame.dataset.src;
    }
  })();
});

/* ════════════════════════════════════════════════════════════════
   GA4 Conversion Tracking + Lead Form (added 2026-06-02)
   - whatsapp_click / phone_click على كل المواضع
   - form_submit + إرسال AJAX لنماذج .c3d-lead-form (يبقى المستخدم بالصفحة)
════════════════════════════════════════════════════════════════ */
(function () {
  /* تتبّع نقرات واتساب والهاتف في أي مكان بالموقع */
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('a[href]') : null;
    if (!a || typeof gtag !== 'function') return;
    var href = a.getAttribute('href') || '';
    if (/wa\.me|api\.whatsapp|whatsapp:/i.test(href)) {
      gtag('event', 'whatsapp_click', { event_category: 'engagement', link_url: href, page_path: location.pathname });
    } else if (/^tel:/i.test(href)) {
      gtag('event', 'phone_click', { event_category: 'engagement', link_url: href, page_path: location.pathname });
    }
  }, true);

  /* نموذج التواصل المبسّط — إرسال AJAX عبر FormSubmit + حدث GA4 */
  document.addEventListener('submit', function (e) {
    var f = e.target;
    if (!f || !f.classList || !f.classList.contains('c3d-lead-form')) return;
    e.preventDefault();
    var msg = f.querySelector('.c3d-lead-msg');
    var btn = f.querySelector('button[type="submit"]');
    var src = f.getAttribute('data-c3d-source') || location.pathname;
    if (typeof gtag === 'function') {
      gtag('event', 'form_submit', { event_category: 'lead', form_source: src, page_path: location.pathname });
    }
    var origLabel = btn ? btn.textContent : '';
    if (btn) { btn.disabled = true; btn.textContent = 'جارٍ الإرسال…'; }
    var fd = new FormData(f);
    fd.append('_subject', 'طلب جديد من صفحة: ' + src);
    fd.append('_captcha', 'false');
    fd.append('_template', 'table');
    fetch('https://formsubmit.co/ajax/info@creativedesignegypt.com', {
      method: 'POST', headers: { 'Accept': 'application/json' }, body: fd
    }).then(function (r) { return r.json(); }).then(function () {
      if (msg) { msg.textContent = 'تم استلام طلبك ✓ سنتواصل معك قريبًا.'; msg.className = 'c3d-lead-msg ok'; }
      f.reset();
      if (btn) { btn.disabled = false; btn.textContent = origLabel; }
    }).catch(function () {
      if (msg) { msg.textContent = 'تعذّر الإرسال — يرجى التواصل عبر واتساب.'; msg.className = 'c3d-lead-msg err'; }
      if (btn) { btn.disabled = false; btn.textContent = origLabel; }
    });
  });
})();

/* ===== C3D_SHARED_I18N — chrome + page sections + placeholders + dynamic content + EN number localization ===== */
(function(){
  var DICT={
    "الرئيسية":"Home",
    "عن المكتب":"About",
    "الخدمات":"Services",
    "مكتب هندسي":"Engineering Office",
    "الباقات":"Packages",
    "الأعمال":"Portfolio",
    "المدونة":"Blog",
    "تواصل معنا":"Contact",
    "مكتب استشاري معتمد منذ 2019":"Certified Design Office Since 2019",
    "أفضل مكتب تصميم داخلي وهندسي في مصر":"Egypt's Premier Interior Design & Architecture Studio",
    "نحوّل مساحاتك إلى تحفة فنية تجمع بين الأناقة والوظيفية":"We transform your spaces into masterpieces blending elegance and function",
    "شاهد أعمالنا":"View Portfolio",
    "استشارة مجانية":"Free Consultation",
    "تصميم معماري متكامل":"Integrated Architectural Design",
    "مشاريع ضخمة بمعايير عالمية":"Large-Scale Projects with Global Standards",
    "من التخطيط العمراني إلى اللمسة النهائية — نقدم حلولاً متكاملة":"From urban planning to final touches — complete integrated solutions",
    "الطراز الكلاسيكي الفاخر":"Luxury Classic Style",
    "جمال الكلاسيك بروح العصر":"Classic Beauty with a Modern Soul",
    "تصاميم راقية تجمع بين الأصالة والرقي في كل تفصيلة":"Refined designs blending heritage and elegance in every detail",
    "خدماتنا":"Our Services",
    "ابدأ مشروعك":"Start Your Project",
    "مشروع منجز":"Completed Projects",
    "سنة خبرة":"Years Experience",
    "رضا العملاء":"Client Satisfaction",
    "جائزة تصميم":"Design Awards",
    "عاماً من التميز":"Years of Excellence",
    "من نحن":"About Us",
    "مكتب تصميم هندسي متكامل":"A Full-Service Architectural Design Studio",
    "Creative3Design مكتب استشاري هندسي معتمد تأسس عام 2019 في القاهرة. نقدم خدمات التصميم الداخلي والمعماري للمشاريع السكنية والتجارية بأعلى معايير الجودة.":"Creative3Design is a certified engineering consultancy founded in 2019 in Cairo. We deliver interior and architectural design services for residential and commercial projects to the highest quality standards.",
    "فريق من كبار المهندسين والمصممين":"Team of senior architects and designers",
    "توظيف أحدث تقنيات التصميم ثلاثي الأبعاد":"Latest 3D design and BIM technologies",
    "إشراف ميداني كامل على التنفيذ":"Full on-site supervision during execution",
    "ضمان الجودة وخدمة ما بعد التسليم":"Quality guarantee and after-delivery service",
    "اعرف أكثر":"Learn More",
    "تحدث معنا":"Talk to Us",
    "ما نقدمه":"What We Offer",
    "خدماتنا الهندسية المتكاملة":"Our Integrated Engineering Services",
    "من الفكرة إلى التسليم — نغطي كل جوانب مشروعك الهندسي":"From concept to handover — we cover every aspect of your project",
    "تصميم داخلي سكني":"Residential Interior Design",
    "تصميم شقق وفيلات ودوبلكس بأسلوب عصري فاخر يعكس هويتك ويناسب أسلوب حياتك.":"Design apartments, villas, and duplexes with a luxurious modern style that reflects your identity.",
    "اكتشف الخدمة":"Explore Service",
    "تصميم داخلي تجاري":"Commercial Interior Design",
    "مكاتب، محلات تجارية، مطاعم، وفنادق — مساحات مصممة لتعزيز الإنتاجية وجذب العملاء.":"Offices, stores, restaurants, hotels — spaces designed to boost productivity and attract clients.",
    "التصميم المعماري":"Architectural Design",
    "رسومات معمارية ومخططات تنفيذية احترافية تجمع بين الجمالية الهندسية والاشتراطات البنائية.":"Professional architectural drawings and execution plans combining engineering aesthetics with building requirements.",
    "التشطيب والتنفيذ":"Finishing & Execution",
    "إشراف كامل على تشطيب الشقق والفيلات بأعلى جودة، مع توريد مواد البناء والديكور المعتمدة.":"Full supervision of apartment and villa finishing to the highest quality, with supply of certified materials.",
    "الاستشارات الهندسية":"Engineering Consultancy",
    "استشارات هندسية متخصصة لمراجعة التصاميم، تقدير التكاليف، واختيار المواد المناسبة لمشروعك.":"Specialized engineering consultations for design review, cost estimation, and material selection.",
    "مكتب هندسي استشاري ←":"Engineering Office →",
    "جولات VR ثلاثية الأبعاد":"3D VR Tours",
    "تجربة مشروعك قبل التنفيذ عبر جولات افتراضية غامرة بتقنية الواقع الافتراضي عالية الدقة.":"Experience your project before execution through immersive virtual reality tours in high definition.",
    "احجز استشارتك المجانية الآن":"Book Your Free Consultation Now",
    "معرض الأعمال":"Portfolio",
    "مشاريع نفخر بها":"Projects We're Proud Of",
    "أكثر من 1100 مشروع منجز في مصر والخليج — كل واحد يحكي قصة تميز":"Over 1100 completed projects in Egypt and the Gulf — each one tells a story of excellence",
    "الكل":"All",
    "فيلات وعمارات":"Villas & Buildings",
    "فنادق":"Hotels",
    "تجاري وإداري":"Commercial & Administrative",
    "رسيبشن فيلا ماونتن فيو":"Mountain View Villa Reception",
    "عرض المشروع":"View project",
    "فيلا بيفرلي هيلز الترا مودرن":"Beverly Hills Ultra Modern Villa",
    "لوبي فيلا ليك فيو":"Lake View Villa Lobby",
    "غرفة نوم فيلا مدينتي":"Madinaty Villa Bedroom",
    "كافيه بجدة":"Jeddah Cafe",
    "مطعم ال مود بمدينتي":"Al Mood Restaurant Madinaty",
    "فنادق وضيافة":"Hotels & Hospitality",
    "شاهد المزيد من المشاريع":"Show More Projects",
    "عرض جميع المشاريع":"View All Projects",
    "بصمتنا في مصر والدول العربية":"Our Footprint in Egypt & Arab World",
    "نفّذنا مشاريع في أكبر الكمبوندات والمدن":"Projects Delivered in Egypt's Top Compounds & Cities",
    "من بالم هيلز إلى الرياض — مشاريعنا تزيّن أرقى الكمبوندات والمشاريع في مصر والخليج العربي":"From Palm Hills to Riyadh — our projects grace the finest compounds and developments across Egypt and the Gulf",
    "كمبوندات ومدن نفّذنا فيها مشاريع — تواصل معنا لمعرفة أقرب مشروع لك":"Compounds & cities where we delivered projects — contact us for a project near you",
    "ابحث عن مشروع في كمبوندك":"Find a Project in Your Compound",
    "الباقات والأسعار":"Packages & Prices",
    "احسب تكلفة مشروعك الآن":"Calculate Your Project Cost",
    "أسعار مايو 2026 — شفافية كاملة قبل البدء في أي مشروع":"May 2026 pricing — full transparency before any project",
    "حاسبة التشطيب":"Finishing Calculator",
    "من 5,500 ج.م/م² (متوسط) حتى 15,000+ ج.م/م² (Ultra VIP) — 5 باقات لكل الميزانيات":"From 5,500 EGP/m² to 15,000+ EGP/m² — 5 packages for every budget",
    "احسب الآن ←":"Calculate Now ←",
    "حاسبة التصميم الداخلي":"Interior Design Calculator",
    "تكلفة التصميم لجميع أنواع المشاريع — شقق، فيلات، مكاتب، مطاعم وأكثر":"Design fees for all project types — apartments, villas, offices, restaurants and more",
    "⭐ الأكثر طلباً":"⭐ Most Popular",
    "حاسبة التصميم المعماري":"Architectural Design Calculator",
    "رسوم التصميم المعماري لجميع أنواع المباني — فيلات، عمارات، فنادق، مستشفيات وأكثر":"Architectural design fees for all building types — villas, apartment buildings, hotels, hospitals and more",
    "مرجع سريع للأسعار — مايو 2026":"Quick Price Reference — May 2026",
    "ستاندرد":"Standard",
    "ج.م/م²":"EGP/m²",
    "بريميم":"Premium",
    "لاكشري":"Luxury",
    "سوبر لاكشري":"Super Luxury",
    "قبل وبعد":"Before & After",
    "شاهد الفرق بنفسك":"See the Difference Yourself",
    "قبل":"Before",
    "بعد":"After",
    "احصل على تصميم مشروعك":"Get Your Project Designed",
    "منهجيتنا":"Our Process",
    "كيف نعمل معك؟":"How Do We Work With You?",
    "6 خطوات واضحة من الفكرة الأولى حتى تسليم المفتاح":"6 clear steps from initial idea to key handover",
    "الاستشارة الأولى":"Initial Consultation",
    "نستمع لاحتياجاتك وأفكارك ونحدد معك رؤية المشروع ونطاق العمل":"We listen to your needs, clarify the project vision and define scope",
    "المعاينة الميدانية":"Site Survey",
    "فريقنا يزور الموقع لأخذ القياسات الدقيقة وتقييم الإمكانيات والقيود":"Our team visits the site for precise measurements and feasibility assessment",
    "التصميم المبدئي":"Concept Design",
    "نقدم مقترحات تصميمية أولية مع لوح المزاج وخيارات المواد والألوان":"We present initial design proposals with mood boards, materials and color options",
    "التصميم التفصيلي":"Detailed Design",
    "رسومات تنفيذية كاملة، تفاصيل الأثاث، الإضاءة، والخامات بتقنية BIM ثلاثية الأبعاد":"Full execution drawings, furniture details, lighting and materials in 3D BIM",
    "التنفيذ والإشراف":"Execution & Supervision",
    "إشراف ميداني مستمر لضمان التنفيذ وفق المواصفات والمعايير الموضوعة":"Continuous on-site supervision to ensure execution per specifications",
    "التسليم والمتابعة":"Handover & Follow-up",
    "تسليم المشروع بالمعاينة الكاملة مع ضمان الجودة وخدمة ما بعد التسليم":"Project handover with full inspection, quality guarantee and post-delivery service",
    "ابدأ رحلتك معنا اليوم":"Start Your Journey With Us Today",
    "لماذا نحن؟":"Why Us?",
    "ما يميزنا عن غيرنا":"What Sets Us Apart",
    "جودة مضمونة":"Guaranteed Quality",
    "كل مشروع يمر بمراحل فحص صارمة قبل التسليم لضمان أعلى معايير الجودة":"Every project undergoes strict inspection before delivery to ensure the highest quality standards",
    "التزام بالمواعيد":"On-Time Delivery",
    "جدول زمني واضح لكل مرحلة مع التزام تام بموعد التسليم المتفق عليه":"Clear timeline for each phase with full commitment to the agreed delivery date",
    "شفافية الأسعار":"Price Transparency",
    "عروض أسعار مفصلة وشفافة بدون تكاليف خفية أو مفاجآت غير متوقعة":"Detailed transparent quotes with no hidden costs or unexpected surprises",
    "فريق متكامل":"Complete Team",
    "معماريون، مصممون داخليون، مهندسون تنفيذيون، ومشرفون متخصصون تحت سقف واحد":"Architects, interior designers, structural engineers and supervisors under one roof",
    "تقنيات حديثة":"Modern Technology",
    "نستخدم أحدث برامج التصميم والواقع الافتراضي لتقديم رؤية دقيقة قبل التنفيذ":"We use the latest design and VR software to provide an accurate vision before execution",
    "خبرة موثوقة":"Proven Experience",
    "22 عاماً وأكثر من 1100 مشروع ناجح يتحدث عن مستوى خبرتنا وثقة عملائنا":"22 years and over 1100 successful projects speak for our expertise and client trust",
    "مكتبة الفيديو":"Video Library",
    "شاهد مشاريعنا حية":"Watch Our Projects Live",
    "جولة فيلا المعادي الفاخرة":"Maadi Luxury Villa Tour",
    "شقة التجمع الخامس المودرن":"Fifth Settlement Modern Apartment",
    "مقر شركة بمدينة نصر":"Nasr City Corporate Office",
    "مطبخ فاخر بالزمالك":"Luxury Zamalek Kitchen",
    "تشطيب شقة المهندسين":"Mohandessin Apartment Finishing",
    "مطعم راقٍ بالقاهرة":"Upscale Cairo Restaurant",
    "احجز جولة VR لمشروعك":"Book a VR Tour for Your Project",
    "آراء عملائنا":"Client Reviews",
    "ماذا يقول عملاؤنا؟":"What Our Clients Say",
    "Creative3Design حوّلت شقتي لتحفة فنية. الاهتمام بالتفاصيل والتسليم في الموعد المحدد جعل التجربة استثنائية. أنصح بهم بشدة.":"Creative3Design transformed my apartment into a masterpiece. Attention to detail and on-time delivery made the experience exceptional. Highly recommended.",
    "المكتب الأفضل في مصر بلا منازع. صمموا لنا مطعمنا بطريقة جعلت العملاء يعودون فقط بسبب الديكور. النتيجة تفوق كل التوقعات.":"The best office in Egypt without question. They designed our restaurant in a way that brings customers back just for the decor. Results exceed all expectations.",
    "تعاملت معهم في تصميم فيلتي وكانت التجربة ممتازة من البداية للنهاية. الفريق محترف والتواصل سريع والنتيجة أجمل من الصور.":"I worked with them on my villa design and the experience was excellent from start to finish. Professional team, fast communication, results more beautiful than the renderings.",
    "أعمالهم تحكي نفسها. ثقة عالية، شفافية في التكاليف، وإبداع لا حدود له. مكتبنا أصبح مضرب المثل في المنطقة.":"Their work speaks for itself. High trust, cost transparency, and unlimited creativity. Our office has become a reference in the area.",
    "نصائح ومقالات هندسية":"Engineering Tips & Articles",
    "دليلك الشامل لكل ما يخص التصميم الداخلي والتشطيبات":"Your comprehensive guide to everything interior design and finishing",
    "اقرأ المزيد ←":"Read More →",
    "جميع المقالات":"All Articles",
    "هل أنت مستعد لبدء مشروعك الآن؟":"Ready to Start Your Project Now?",
    "احصل على استشارة مجانية مع أحد مهندسينا المتخصصين — بدون التزام ولا شروط":"Get a free consultation with one of our specialized engineers — no commitment, no conditions",
    "احجز استشارة مجانية الآن":"Book a free consultation now",
    "اتصل بنا مباشرة":"Call Us Directly",
    "موقعنا":"Our Location",
    "زورنا في مكتبنا":"Visit Us at Our Office",
    "العنوان":"Address",
    "التجمع الخامس، فيلا 64، المنطقة الأولى، الحي الثاني، القاهرة 11835":"Fifth Assembly, Villa 64, First Area, District 2, Cairo 11835",
    "الهاتف":"Phone",
    "أوقات العمل":"Working Hours",
    "السبت — الخميس: 9 ص — 6 م":"Sat — Thu: 9 AM — 6 PM",
    "تواصل عبر واتساب":"Contact via WhatsApp",
    "مكتب تصميم داخلي واستشاري معتمد في القاهرة. خبرة 22+ سنة في تحويل المساحات إلى تحف هندسية.":"Certified interior design and consultancy office in Cairo. 22+ years of experience transforming spaces into engineering masterpieces.",
    "روابط سريعة":"Quick Links",
    "© 2026 Creative3Design — جميع الحقوق محفوظة":"© 2026 Creative3Design — All Rights Reserved",
    "مكتب هندسي استشاري بخبرة 22 عاماً":"A consulting engineering office with 22 years of experience",
    "Creative3Design مكتب هندسي استشاري معتمد وعضو نقابة المهندسين، تأسس في القاهرة (التجمع الخامس – القاهرة الجديدة) عام 2019، بخبرة فريق تتجاوز 22 عاماً. يجمع بين دقّة المكتب الاستشاري وإبداع مكتب التصميم المعماري، ونرافق عملاءنا من فكرة المشروع الأولى وحتى تسليم المفتاح، بفريق من المهندسين المعماريين والإنشائيين والمتخصصين في التصميم الداخلي.":"Creative3Design is an accredited consulting engineering office and a member of the Engineers Syndicate, founded in Cairo (Fifth Settlement – New Cairo) in 2019, with a team whose experience exceeds 22 years. It combines the precision of a consulting office with the creativity of an architectural design studio, accompanying our clients from the very first project idea through to turnkey handover, with a team of architects, structural engineers, and interior design specialists.",
    "مكتب استشاري معتمد بسجل مهني موثّق":"Accredited consulting office with a documented professional record",
    "استشارات هندسية متكاملة للمشاريع السكنية والتجارية":"Integrated engineering consultancy for residential & commercial projects",
    "تصاميم معمارية بتقنية BIM وجولات VR ثلاثية الأبعاد":"Architectural designs using BIM technology and 3D VR tours",
    "تعرّف على المكتب أكثر":"Learn more about the office",
    "خدمات المكتب الهندسي":"Engineering Office Services",
    "ماذا يقدّم مكتبنا الهندسي الاستشاري":"What our consulting engineering office offers",
    "منظومة خدمات هندسية متكاملة تحت سقف مكتب واحد":"An integrated suite of engineering services under one roof",
    "استشارات هندسية":"Engineering Consultancy",
    "كمكتب استشارات هندسية نقدّم الدراسة الفنية، تقدير التكلفة، ومراجعة المخططات، مع توصيات هندسية دقيقة قبل بدء أي مشروع.":"As an engineering consultancy, we provide the technical study, cost estimation, and plan review, with precise engineering recommendations before any project begins.",
    "مكتب تصميم معماري":"Architectural Design Office",
    "تصميم الواجهات والمخططات المعمارية والرسومات التنفيذية المعتمدة لجميع أنواع المباني السكنية والتجارية.":"Design of façades, architectural plans, and certified shop drawings for all types of residential and commercial buildings.",
    "تصميم داخلي فاخر":"Luxury Interior Design",
    "تصميم المساحات الداخلية بأساليب الـ Ultra-Modern والـ New Classic مع اختيار خامات وإضاءة احترافية.":"Designing interior spaces in Ultra-Modern and New Classic styles, with professional selection of materials and lighting.",
    "تشطيب وإشراف هندسي":"Finishing & Engineering Supervision",
    "إشراف ميداني كامل على التنفيذ والتشطيب بأعلى معايير الجودة، من الخرسانة حتى تسليم المفتاح.":"Full on-site supervision of execution and finishing to the highest quality standards, from concrete to turnkey handover.",
    "تصميم المكاتب والمحلات والمطاعم والفنادق — مساحات تجارية تعزّز إنتاجيتك وتجذب عملاءك.":"Design of offices, shops, restaurants, and hotels — commercial spaces that boost your productivity and attract your clients.",
    "جولة افتراضية تفاعلية تتيح لك التنقل داخل مشروعك ومعاينته بالأبعاد الحقيقية قبل بدء التنفيذ.":"An interactive virtual tour that lets you navigate your project and preview it at true scale before execution begins.",
    "عرض كل الخدمات الهندسية":"View all engineering services",
    "التصميم المعماري حسب نوع المبنى":"Architectural design by building type",
    "مكتب تصميم معماري لكل أنواع المباني":"An architectural design office for every building type",
    "كمكتب هندسي استشاري معتمد، نصمّم وننفّذ كل أنواع المباني بمعايير إنشائية ومعمارية معتمدة من نقابة المهندسين":"As an accredited consulting engineering office, we design and build all building types to structural and architectural standards certified by the Engineers Syndicate.",
    "تصميم فيلات وقصور":"Villas & Palaces Design",
    "تصميم فيلات وقصور فاخرة — تصميم معماري للواجهات والمخططات + تصميم داخلي وإشراف على التنفيذ حتى التسليم.":"Design of luxury villas and palaces — architectural design of façades and plans + interior design and execution supervision through handover.",
    "تصميم عمائر سكنية":"Residential Buildings Design",
    "تصميم عمائر وأبراج سكنية بمخططات إنشائية معتمدة، استغلال أمثل للمساحات، ورسومات تنفيذية كاملة.":"Design of residential buildings and towers with certified structural plans, optimal use of space, and complete shop drawings.",
    "تصميم مولات ومراكز تجارية":"Malls & Commercial Centers Design",
    "تصميم مولات ومراكز تجارية وكمبوندات — تخطيط تجاري يعزّز الحركة والإيرادات بهوية معمارية مميزة.":"Design of malls, commercial centers, and compounds — commercial planning that boosts footfall and revenue with a distinctive architectural identity.",
    "تصميم فنادق ومنتجعات":"Hotels & Resorts Design",
    "تصميم فنادق ومنتجعات سياحية بمعايير ضيافة عالمية — من التصميم المعماري حتى التشطيب الداخلي الفاخر.":"Design of hotels and tourist resorts to international hospitality standards — from architectural design to luxury interior finishing.",
    "تصميم مصانع ومستودعات":"Factories & Warehouses Design",
    "تصميم مصانع ومستودعات صناعية بمخططات إنشائية وأنظمة كهروميكانيكية متكاملة وفق الأكواد المعتمدة.":"Design of industrial factories and warehouses with structural plans and integrated electromechanical systems per approved codes.",
    "رسومات تنفيذية وإشراف هندسي":"Shop Drawings & Engineering Supervision",
    "رسومات تنفيذية (شوب درووينج)، إشراف هندسي ميداني، رفع مساحي، ودعم استخراج تراخيص البناء.":"Shop drawings, on-site engineering supervision, land surveying, and support in obtaining building permits.",
    "احسب رسوم التصميم المعماري":"Calculate architectural design fees",
    "أعمالنا":"Our Work",
    "مشاريع من أعمال المكتب الهندسي":"Projects from the engineering office's portfolio",
    "نماذج حقيقية من مشاريع التصميم المعماري والداخلي والتشطيب التي نفّذها مكتبنا":"Real examples of architectural, interior, and finishing projects delivered by our office",
    "احسب تكلفة مشروعك الهندسي الآن":"Calculate your engineering project cost now",
    "أسعار 2026 — شفافية كاملة قبل البدء في أي مشروع":"2026 pricing — full transparency before starting any project",
    "حاسبات تفاعلية":"Interactive calculators",
    "← اسحب جانباً للتنقل بين الحاسبات":"← Swipe aside to move between calculators",
    "رسوم التصميم المعماري للمباني السكنية والتجارية والصناعية — فيلات، عمارات، فنادق، مستشفيات وأكثر":"Architectural design fees for residential, commercial, and industrial buildings — villas, apartment buildings, hotels, hospitals, and more",
    "مرجع سريع لأسعار التصميم المعماري — 2026 · 60 ج.م/م² لكل أنواع المباني":"Quick reference for architectural design pricing — 2026 · EGP 60/m² for all building types",
    "فيلا سكنية":"Residential Villa",
    "عمارة سكنية":"Residential Building",
    "مبنى تجاري":"Commercial Building",
    "مبنى إداري":"Administrative Building",
    "فندق / منتجع":"Hotel / Resort",
    "🏛️ حاسبة التصميم المعماري":"🏛️ Architectural Design Calculator",
    "عرض كل الباقات والأسعار":"View all packages & pricing",
    "أبرز عملائنا":"Our Notable Clients",
    "لماذا نحن":"Why Us",
    "لماذا Creative3Design أفضل مكتب هندسي في مصر؟":"Why is Creative3Design the best engineering office in Egypt?",
    "اختيار أفضل مكتب هندسي في مصر يعتمد على الخبرة والاعتماد وجودة التنفيذ — وهي معايير نتفوّق فيها كمكتب هندسي استشاري متكامل.":"Choosing the best engineering office in Egypt depends on experience, accreditation, and execution quality — criteria where we excel as an integrated consulting engineering office.",
    "22+ سنة خبرة و1100+ مشروع منجز موثّق":"22+ years of experience and 1,100+ documented completed projects",
    "أسعار شفافة معلنة تبدأ من 5,500 ج.م/م²":"Transparent, published pricing starting from EGP 5,500/m²",
    "تقنيات حديثة: BIM، جولات VR، تصور ثلاثي الأبعاد":"Modern technologies: BIM, VR tours, 3D visualization",
    "فريق هندسي متكامل وإشراف حتى تسليم المفتاح":"A complete engineering team with supervision through turnkey handover",
    "عرض الباقات والأسعار":"View packages & pricing",
    "أسئلة شائعة":"FAQ",
    "أسئلة شائعة عن المكتب الهندسي الاستشاري":"Frequently asked questions about the consulting engineering office",
    "اضغط على أي سؤال لعرض الإجابة":"Tap any question to view the answer",
    "ما هو أفضل مكتب هندسي في مصر؟":"What is the best engineering office in Egypt?",
    "ما الفرق بين المكتب الهندسي والمكتب الاستشاري؟":"What's the difference between an engineering office and a consulting office?",
    "هل تقدمون خدمة مكتب استشارات هندسية للمشاريع التجارية والسكنية؟":"Do you offer engineering consultancy services for commercial and residential projects?",
    "ماذا يقدّم مكتب التصميم المعماري لديكم؟":"What does your architectural design office offer?",
    "من المدونة":"From the Blog",
    "مقالات ذات صلة عن المكتب الهندسي":"Related articles about the engineering office",
    "أدلّة متخصّصة تساعدك في اختيار مكتبك الهندسي وفهم التصميم المعماري والتكاليف":"Specialized guides to help you choose your engineering office and understand architectural design and costs",
    "مكتب هندسي استشاري":"Consulting Engineering Office",
    "كيف تختار أفضل مكتب هندسي استشاري في مصر 2026؟":"How to choose the best consulting engineering office in Egypt 2026?",
    "اقرأ المقال ←":"Read article ←",
    "مكتب استشارات هندسية":"Engineering Consultancy",
    "مكتب استشارات هندسية — الخدمات والأسعار ومعايير الاختيار":"Engineering consultancy — services, pricing, and selection criteria",
    "تصميم معماري":"Architectural Design",
    "التصميم المعماري لأنواع المباني — فيلات وعمائر ومولات وفنادق ومصانع":"Architectural design for building types — villas, residential buildings, malls, hotels, and factories",
    "تصميم فيلات":"Villa Design",
    "التصميم المعماري للفيلات — المراحل والتكاليف والترخيص":"Architectural design for villas — stages, costs, and permitting",
    "كل مقالات المدونة":"All blog articles",
    "جاهز للبدء مع أفضل مكتب هندسي استشاري؟":"Ready to start with the best consulting engineering office?",
    "تواصل معنا الآن للحصول على استشارة هندسية مجانية مع أحد مهندسينا المتخصصين":"Contact us now for a free engineering consultation with one of our specialized engineers",
    "احجز استشارة هندسية مجانية الآن":"Book a free engineering consultation now",
    "تواصل مع المكتب":"Contact the office",
    "واتساب مباشر":"Live WhatsApp",
    "واتساب":"WhatsApp",
    "الصفحات ▾":"Pages ▾",
    "الصفحات":"Pages",
    "🏠 الرئيسية":"🏠 Home",
    "🏢 عن المكتب":"🏢 About",
    "⚙️ الخدمات":"⚙️ Services",
    "🏛️ مكتب هندسي":"🏛️ Engineering Office",
    "📦 الباقات":"📦 Packages",
    "🖼️ الأعمال":"🖼️ Portfolio",
    "📝 المدونة":"📝 Blog",
    "📞 تواصل معنا":"📞 Contact",
    "تعرّف على المكتب الهندسي الاستشاري":"Discover our consulting engineering office",
    "نصمم المساحات السكنية بأسلوب يعكس شخصيتك ويناسب أسلوب حياتك — شقق، فيلات، دوبلكس، وبنتهاوس.":"We design residential spaces with a style that reflects your personality and suits your lifestyle — apartments, villas, duplexes, and penthouses.",
    "تصاميم ثلاثية الأبعاد قبل التنفيذ":"3D designs before execution",
    "اختيار مواد وألوان احترافي":"Professional material & color selection",
    "إشراف كامل على التنفيذ":"Full execution supervision",
    "احصل على استشارة مجانية":"Get a free consultation",
    "نصمم بيئات تجارية تعزز إنتاجيتك وتبهر عملاءك — مكاتب، محلات، مطاعم، فنادق، ومراكز صحية.":"We design commercial environments that boost your productivity and impress your clients — offices, shops, restaurants, hotels, and healthcare centers.",
    "هوية بصرية متسقة مع علامتك التجارية":"Visual identity consistent with your brand",
    "توزيع مساحات وفق سير العمل":"Space planning aligned with workflow",
    "حلول ذكية للإضاءة والصوتيات":"Smart lighting & acoustics solutions",
    "ابدأ مشروعك التجاري":"Start your commercial project",
    "كـ مكتب تصميم معماري متخصص، نقدّم رسومات معمارية احترافية بمعايير هندسية معتمدة — واجهات، مخططات، رسومات تنفيذية كاملة بتقنية BIM.":"As a specialized architectural design office, we deliver professional architectural drawings to certified engineering standards — façades, layouts, and complete shop drawings using BIM technology.",
    "تصميم واجهات خارجية مميزة":"Distinctive exterior façade design",
    "مخططات تنفيذية معتمدة":"Certified working drawings",
    "تصاميم BIM ثلاثية الأبعاد":"3D BIM designs",
    "استشر مهندسنا المعماري":"Consult our architect",
    "إشراف ميداني كامل على تشطيب الشقق والفيلات — من الخرسانة حتى تسليم المفتاح بأعلى معايير الجودة.":"Full on-site supervision for finishing apartments and villas — from concrete to turnkey handover at the highest quality standards.",
    "توريد مواد بناء معتمدة":"Supply of certified building materials",
    "فريق حرفيين متخصصين":"Specialized team of craftsmen",
    "ضمان جودة حتى التسليم":"Quality guarantee until handover",
    "احجز معاينة مجانية":"Book a free site visit",
    "جاهز لبدء مشروعك؟":"Ready to start your project?",
    "تواصل معنا الآن للحصول على استشارة مجانية مع أحد مهندسينا المتخصصين":"Contact us now for a free consultation with one of our specialized engineers",
    "تواصل مع أفضل مكتب تصميم داخلي وتشطيب في مصر":"Contact the best interior design & finishing office in Egypt",
    "استشارة مجانية مع مهندسينا المتخصصين — تواصل الآن":"A free consultation with our specialized engineers — get in touch now",
    "ابدأ محادثة واتساب":"Start a WhatsApp chat",
    "أرسل لنا رسالة":"Send us a message",
    "الاسم الكامل *":"Full name *",
    "رقم الهاتف *":"Phone number *",
    "نوع الخدمة المطلوبة":"Service required",
    "اختر الخدمة":"Choose a service",
    "تشطيب شقق":"Apartment finishing",
    "استشارة هندسية":"Engineering consultation",
    "جولة VR ثلاثية الأبعاد":"3D VR tour",
    "تفاصيل مشروعك":"Your project details",
    "أحمد محمد":"e.g. Ahmed Mohamed",
    "اكتب تفاصيل مشروعك هنا (المساحة، الميزانية التقريبية، الموقع...)":"Write your project details here (area, approximate budget, location...)",
    "دليلك الشامل لكل ما يخص التصميم الداخلي، التشطيبات، والديكور الفاخر":"Your complete guide to everything about interior design, finishing, and luxury décor",
    "جديد يونيو 2026":"New · June 2026",
    "تصميم فيلا مودرن في مصر 2026 — الأسلوب والخامات والتكلفة":"Modern Villa Design in Egypt 2026 — Style, Materials & Cost",
    "خصائص الطراز المودرن، الواجهات، التوزيع الداخلي، أفضل الخامات، وتكلفة التصميم والتنفيذ لكل مستوى.":"Modern-style features, façades, interior layout, the best materials, and design & build cost for every level.",
    "تكلفة تجديد شقة قديمة في مصر 2026 — تفصيل البنود بالأرقام":"Cost of Renovating an Old Apartment in Egypt 2026 — Itemized in Numbers",
    "تكسير، سباكة، كهرباء، أرضيات، دهانات، نجارة، حمامات ومطبخ — جداول أرقام واقعية لكل بند وكيف توزّع ميزانيتك.":"Demolition, plumbing, electrical, flooring, paint, carpentry, bathrooms and kitchen — realistic cost tables for each item and how to allocate your budget.",
    "أفضل ألوان الصالة المعيشية 2026 — دليل اختيار الألوان":"Best Living Room Colors 2026 — A Color Selection Guide",
    "أحدث ترندات الألوان، قاعدة 60-30-10، الألوان حسب الإضاءة والمساحة، وأفضل التركيبات اللونية لصالة متناسقة.":"The latest color trends, the 60-30-10 rule, colors by lighting and space, and the best color combinations for a harmonious living room.",
    "تصميم غرفة أطفال 2026 — أفكار إبداعية وأسعار التنفيذ":"Kids' Room Design 2026 — Creative Ideas & Build Prices",
    "ألوان، أثاث يكبر مع الطفل، تخزين ذكي، إضاءة وأمان — غرفة أطفال آمنة وعملية وجميلة مع أسعار التنفيذ في مصر لكل ميزانية.":"Colors, furniture that grows with your child, smart storage, lighting and safety — a safe, practical, beautiful kids' room with build prices in Egypt for every budget.",
    "مكتب استشارات هندسية في مصر 2026 — الخدمات والأسعار ومعايير الاختيار":"Engineering Consultancy Office in Egypt 2026 — Services, Prices & Selection Criteria",
    "ما خدمات المكتب الاستشاري؟ كم أتعابه؟ الفرق بينه وبين المقاول، و6 معايير لاختيار المكتب الهندسي المناسب لمشروعك.":"What does a consulting office do? What are its fees? The difference between it and a contractor, and 6 criteria for choosing the right engineering office for your project.",
    "أسعار الباركيه والسيراميك في مصر 2026 — مقارنة شاملة":"Parquet & Ceramic Prices in Egypt 2026 — A Complete Comparison",
    "سعر متر الباركيه (لامينيت، SPC، خشب مهندس) والسيراميك المحلي والمستورد 2026 — مقارنة المتانة والمظهر وأفضل اختيار لكل غرفة وميزانية.":"Per-meter prices of parquet (laminate, SPC, engineered wood) and local & imported ceramic 2026 — comparing durability, appearance, and the best choice for each room and budget.",
    "يونيو 2026":"June 2026",
    "9 دقائق قراءة":"9 min read",
    "جديد مايو 2026":"New · May 2026",
    "تصميم صالة معيشة مودرن 2026 — 20 فكرة ذكية بأسعار مناسبة":"Modern Living Room Design 2026 — 20 Smart Ideas at Affordable Prices",
    "20 فكرة ذكية لتصميم صالة معيشة مودرن في مصر 2026 — ألوان، أثاث، إضاءة وديكور بأسعار مناسبة.":"20 smart ideas for designing a modern living room in Egypt 2026 — colors, furniture, lighting and décor at affordable prices.",
    "أسعار الرخام والبورسلين في مصر 2026 — دليل المقارنة الكامل":"Marble & Porcelain Prices in Egypt 2026 — The Complete Comparison Guide",
    "سعر المتر لكل نوع، مقارنة الجودة والمتانة، وأفضل الاختيار لكل ميزانية — من رخام مصري 350 ج حتى إيطالي 6,000 ج.":"Per-meter price for each type, a quality and durability comparison, and the best choice for every budget — from Egyptian marble at EGP 350 to Italian at EGP 6,000.",
    "مايو 2026":"May 2026",
    "تصميم حمام صغير 2026 — 12 فكرة ذكية لتحويله إلى مساحة فاخرة":"Small Bathroom Design 2026 — 12 Smart Ideas to Turn It Into a Luxury Space",
    "12 فكرة مجربة لتصميم حمام صغير أنيق وعملي — بلاط، إضاءة، تخزين ذكي، ألوان، وأسعار التنفيذ في مصر 2026 بالتفصيل.":"12 proven ideas for an elegant, practical small bathroom — tiling, lighting, smart storage, colors, and build prices in Egypt 2026 in detail.",
    "تصميم صالة معيشة صغيرة 2026 — 15 فكرة ذكية لاستغلال المساحة":"Small Living Room Design 2026 — 15 Smart Ideas to Maximize Space",
    "15 فكرة مجربة لتصميم صالة معيشة صغيرة أنيقة — الألوان، الأثاث، الإضاءة، وحلول التخزين مع أسعار التنفيذ في مصر 2026.":"15 proven ideas for an elegant small living room — colors, furniture, lighting, and storage solutions with build prices in Egypt 2026.",
    "تصميم مطبخ صغير 2026 — 10 أفكار ذكية لاستغلال كل متر":"Small Kitchen Design 2026 — 10 Smart Ideas to Use Every Meter",
    "10 أفكار مجربة لتصميم مطبخ صغير عملي وجميل — أشكال المطبخ، الألوان، حلول التخزين، وأسعار التشطيب في مصر 2026.":"10 proven ideas for a practical, beautiful small kitchen — kitchen layouts, colors, storage solutions, and finishing prices in Egypt 2026.",
    "جديد 2026":"New · 2026",
    "أسعار تشطيب الشقق في القاهرة 2026 — دليل شامل بالأرقام الحقيقية":"Apartment Finishing Prices in Cairo 2026 — A Complete Guide with Real Numbers",
    "جداول أسعار تفصيلية لتشطيب الشقق في مدينة نصر والتجمع والمعادي والعاصمة الإدارية وجميع مناطق القاهرة 2026.":"Detailed price tables for apartment finishing in Nasr City, the Fifth Settlement, Maadi, the New Administrative Capital, and all areas of Cairo 2026.",
    "تصميم غرفة نوم صغيرة 2026 — 12 فكرة ذكية لاستغلال كل سنتيمتر":"Small Bedroom Design 2026 — 12 Smart Ideas to Use Every Centimeter",
    "12 فكرة مجربة لتصميم غرفة نوم صغيرة تبدو أكبر — ألوان، أثاث، تخزين، إضاءة بأسعار 2026.":"12 proven ideas to design a small bedroom that looks bigger — colors, furniture, storage, and lighting at 2026 prices.",
    "الفرق بين تشطيب ستاندرد ولاكشري: دليل الأسعار والمواصفات 2026":"Standard vs. Luxury Finishing: A Price & Specifications Guide 2026",
    "مقارنة شاملة بالأرقام بين مستويات التشطيب الأربعة في مصر 2026 — الخامات والأسعار وأثرها على قيمة العقار.":"A comprehensive, numbers-based comparison of the four finishing levels in Egypt 2026 — materials, prices, and their impact on property value.",
    "مراحل تشطيب الشقة من الصفر 2026 — الترتيب الصحيح خطوة بخطوة":"Apartment Finishing Stages from Scratch 2026 — The Correct Order Step by Step",
    "7 مراحل من الأعمال المدنية حتى التسليم، مع جدول زمني واقعي وتكلفة كل مرحلة.":"7 stages from civil works to handover, with a realistic timeline and the cost of each stage.",
    "تكلفة تشطيب فيلا 2026 — دليل الأسعار من الصفر حتى التسليم":"Villa Finishing Cost 2026 — A Price Guide from Scratch to Handover",
    "كم يكلف تشطيب فيلا في مصر 2026؟ أسعار تفصيلية لكل باقة، مقارنة فيلا مقابل شقة، وجدول زمني واقعي للتنفيذ.":"How much does finishing a villa in Egypt 2026 cost? Detailed prices for each package, a villa-vs-apartment comparison, and a realistic execution timeline.",
    "تصميم مطبخ عصري في مصر 2026 — الخيارات والأسعار الحقيقية":"Modern Kitchen Design in Egypt 2026 — Options & Real Prices",
    "دليل شامل لتصميم المطبخ في مصر 2026 — أشكال المطبخ المناسبة، مقارنة الخامات، والأسعار الفعلية.":"A complete guide to kitchen design in Egypt 2026 — suitable kitchen layouts, a materials comparison, and actual prices.",
    "عقد التشطيب في مصر 2026 — 12 بنداً لا تقبل مشروعاً بدونها":"The Finishing Contract in Egypt 2026 — 12 Clauses You Should Never Accept a Project Without",
    "دليل قانوني وعملي لعقد التشطيب في مصر 2026 — البنود الإلزامية الـ12 التي تحميك من الخلافات والتأخير.":"A legal and practical guide to the finishing contract in Egypt 2026 — the 12 mandatory clauses that protect you from disputes and delays.",
    "تجديد شقة قديمة في مصر 2026 — التكاليف والأولويات خطوة بخطوة":"Renovating an Old Apartment in Egypt 2026 — Costs and Priorities Step by Step",
    "دليل شامل لتجديد شقة قديمة في مصر 2026 — متى تجدد ومتى تبني من جديد، وكيف توزع الميزانية بذكاء.":"A complete guide to renovating an old apartment in Egypt 2026 — when to renovate and when to rebuild, and how to allocate your budget wisely.",
    "كيف تتحكم في ميزانية التشطيب وتتجنب التجاوزات في مصر 2026":"How to Control Your Finishing Budget and Avoid Overruns in Egypt 2026",
    "دليل عملي للتحكم في ميزانية تشطيب شقتك في مصر 2026 — كيف توزع الميزانية وتتجنب التكاليف المفاجئة.":"A practical guide to controlling your apartment finishing budget in Egypt 2026 — how to allocate the budget and avoid surprise costs.",
    "أكثر 7 أخطاء شائعة في التصميم الداخلي 2026 وكيف تتجنبها نهائياً":"The 7 Most Common Interior Design Mistakes 2026 and How to Avoid Them for Good",
    "اكتشف أخطاء التصميم الداخلي الأكثر شيوعاً التي يقع فيها أصحاب المنازل وكيف يتجنبها محترفو Creative3Design.":"Discover the most common interior design mistakes homeowners make and how Creative3Design's professionals avoid them.",
    "كيف تختار شركة تشطيب موثوقة في مصر 2026 — 9 معايير احترافية":"How to Choose a Reliable Finishing Company in Egypt 2026 — 9 Professional Criteria",
    "تعرّف على المعايير الـ9 التي يجب أن تتوفر في أي شركة تشطيب قبل توقيع العقد، وتجنّب الأخطاء المكلفة.":"Learn the 9 criteria any finishing company must meet before you sign the contract, and avoid costly mistakes.",
    "التصميم المعماري للفيلات في مصر 2026 — المراحل الكاملة والتكاليف الحقيقية":"Architectural Design for Villas in Egypt 2026 — The Complete Stages, Costs & Required Paperwork",
    "دليل شامل يكشف مراحل التصميم المعماري للفيلات، التكاليف الفعلية، والأوراق المطلوبة في مصر 2026.":"A complete guide revealing the architectural design stages for villas, the actual costs, and the required paperwork in Egypt 2026.",
    "تشطيبات":"Finishing",
    "تشطيب شقق 2025: الدليل الكامل للأسعار والمراحل":"Apartment Finishing 2025: The Complete Guide to Prices & Stages",
    "كل ما تحتاج معرفته قبل بدء تشطيب شقتك — المراحل، الأسعار، والتحذيرات الهامة.":"Everything you need to know before starting your apartment finishing — stages, prices, and important warnings.",
    "تصميم داخلي":"Interior Design",
    "أفضل أساليب التصميم الداخلي المودرن لعام 2025":"The Best Modern Interior Design Styles for 2025",
    "استعراض لأبرز توجهات التصميم الداخلي العصري وكيف تختار الأسلوب المناسب لمنزلك.":"An overview of the top modern interior design trends and how to choose the right style for your home.",
    "فيلات":"Villas",
    "كيف تصمم فيلا فاخرة من الصفر؟ دليل شامل":"How to Design a Luxury Villa from Scratch? A Complete Guide",
    "الخطوات العملية لتصميم فيلا فاخرة تجمع بين الجمال والوظيفية والاستدامة.":"The practical steps to design a luxury villa that combines beauty, functionality, and sustainability.",
    "تجاري":"Commercial",
    "تصميم مكتب احترافي يزيد إنتاجية فريقك":"A Professional Office Design That Boosts Your Team's Productivity",
    "كيف يؤثر التصميم الداخلي للمكتب على إنتاجية الموظفين وانطباع العملاء.":"How an office's interior design affects employee productivity and client impressions.",
    "نصائح":"Tips",
    "متى تحتاج مهندس تصميم داخلي؟ 5 علامات واضحة":"When Do You Need an Interior Designer? 5 Clear Signs",
    "هل تحتاج لمهندس تصميم داخلي أم يمكنك التصميم بنفسك؟ اعرف الإجابة الآن.":"Do you need an interior designer or can you design it yourself? Find out now.",
    "تكلفة تصميم فيلا 2026 — أتعاب المهندس والمصمم الداخلي بالأرقام":"Villa Design Cost 2026 — Architect & Interior Designer Fees in Numbers",
    "كم تدفع للمهندس المعماري والمصمم الداخلي لتصميم فيلتك؟ جداول أسعار + حاسبة تقريبية + 5 أخطاء شائعة.":"How much do you pay the architect and interior designer to design your villa? Price tables + an approximate calculator + 5 common mistakes.",
    "استشارات":"Consulting",
    "مكتب هندسي استشاري في مصر 2026 — كيف تختار الأفضل؟":"Consulting Engineering Office in Egypt 2026 — How to Choose the Best?",
    "دليل كامل لاختيار المكتب الهندسي الاستشاري المناسب — خدمات، معايير، أسعار، وأسئلة يجب طرحها قبل التعاقد.":"A complete guide to choosing the right consulting engineering office — services, criteria, prices, and questions to ask before signing.",
    "تشطيب شقة 100 متر في مصر 2026 — التكلفة الحقيقية شاملة كل شيء":"Finishing a 100 m² Apartment in Egypt 2026 — The Real All-Inclusive Cost",
    "جدول تكاليف مفصّل لتشطيب شقة 100م² بـ 4 مستويات — من 550,000 ج.م (ستاندرد) حتى 1,250,000+ ج.م (سوبر لاكشري).":"A detailed cost table for finishing a 100 m² apartment across 4 levels — from EGP 550,000 (Standard) to EGP 1,250,000+ (Super Luxury).",
    "هل لديك مشروع تريد تنفيذه؟":"Have a project you want to build?",
    "تواصل معنا الآن للحصول على استشارة مجانية مع أحد مهندسينا":"Contact us now for a free consultation with one of our engineers",
    "احجز استشارة مجانية":"Book a free consultation",
    "دليل شامل":"Complete Guide",
    "دليل التصميم الداخلي الشامل 2026 — 25 مقالة في مكان واحد":"The Complete Interior Design Guide 2026 — 25 Articles in One Place",
    "كل ما تحتاجه عن التشطيب والتصميم الداخلي في مصر 2026 — أسعار، نصائح، مراحل، وتصميم الغرف في 4 أقسام.":"Everything you need about finishing and interior design in Egypt 2026 — prices, tips, stages, and room design in 4 sections.",
    "استعرض الدليل ←":"Browse the guide ←",
    "أسعار مايو 2026 — حاسبة التشطيب · حاسبة التصميم الداخلي · حاسبة التصميم المعماري لجميع أنواع المباني":"May 2026 prices — Finishing Calculator · Interior Design Calculator · Architectural Design Calculator for all building types",
    "حاسبة تكلفة التشطيب":"Finishing Cost Calculator",
    "التشطيب":"Finishing",
    "التصميم الداخلي":"Interior Design",
    "🏢 شقة سكنية":"🏢 Residential Apartment",
    "🏡 فيلا":"🏡 Villa",
    "🏛️ مكتب":"🏛️ Office",
    "🛍️ محل تجاري":"🛍️ Retail Shop",
    "🍽️ مطعم / كافيه":"🍽️ Restaurant / Café",
    "المساحة":"Area",
    "40 م²":"40 m²",
    "1,000 م²":"1,000 m²",
    "سيراميك بورسلان محلي":"Local porcelain ceramic",
    "جبس مستوى أول":"First-level gypsum",
    "دهان أكريليك":"Acrylic paint",
    "أعمال سباكة وكهرباء":"Plumbing & electrical works",
    "بورسلان مستورد إيطالي":"Imported Italian porcelain",
    "جبس ديكوري 3D":"3D decorative gypsum",
    "إضاءة LED مخفية":"Concealed LED lighting",
    "مدير مشروع مخصص":"Dedicated project manager",
    "رخام طبيعي تركي/إسباني":"Natural Turkish/Spanish marble",
    "أبواب هايت مودرن":"Modern high doors",
    "سقف مزدوج + إضاءة":"Double ceiling + lighting",
    "أنظمة صوت وشاشات":"Audio systems & screens",
    "رخام إيطالي كارارا":"Italian Carrara marble",
    "أتمتة منزلية كاملة":"Full home automation",
    "خامات أوروبية حصرية":"Exclusive European materials",
    "ضمان 4 سنوات":"4-year warranty",
    "حسب الطلب كلياً":"Fully bespoke",
    "مواد نادرة":"Rare materials",
    "ضمان 5 سنوات":"5-year warranty",
    "المميزات":"Features",
    "سعر المتر (ج.م)":"Price per m² (EGP)",
    "رخام / بورسلان مستورد":"Imported marble / porcelain",
    "جبس ديكوري":"Decorative gypsum",
    "إضاءة مخفية LED":"Concealed LED lighting",
    "أتمتة منزلية":"Home automation",
    "ضمان على التنفيذ":"Workmanship warranty",
    "سنة":"1 year",
    "سنتان":"2 years",
    "3 سنوات":"3 years",
    "4 سنوات":"4 years",
    "5 سنوات":"5 years",
    "شقة سكنية":"Residential Apartment",
    "فيلا":"Villa",
    "مكتب":"Office",
    "مطعم / كافيه":"Restaurant / Café",
    "محل / معرض":"Shop / Showroom",
    "جيم / سبا":"Gym / Spa",
    "عيادة / مركز طبي":"Clinic / Medical Center",
    "50 م²":"50 m²",
    "2,000 م²":"2,000 m²",
    "رسوم التصميم المعماري فقط — أسعار مايو 2026 وفق متوسطات السوق المصري":"Architectural design fees only — May 2026 prices per Egyptian market averages",
    "مول / كمبوند":"Mall / Compound",
    "مصنع / مستودع":"Factory / Warehouse",
    "مدرسة / جامعة":"School / University",
    "مستشفى / طبي":"Hospital / Medical",
    "متعدد الاستخدام":"Mixed-use",
    "مساحة الدور الواحد":"Single-floor area",
    "100 م²":"100 m²",
    "10,000 م²":"10,000 m²",
    "عدد الأدوار":"Number of floors",
    "📋 أساسي (2D فقط)":"📋 Basic (2D only)",
    "📐 ستاندرد (2D+3D)":"📐 Standard (2D+3D)",
    "✨ بريميم +":"✨ Premium +",
    "🏆 شامل كامل":"🏆 All-inclusive",
    "طلب عرض سعر":"Request a Quote",
    "أرسل لنا مساحة مشروعك ونوعه وسنرسل إليك عرض سعر تفصيلي خلال 24 ساعة.":"Send us your project's area and type, and we'll send you a detailed quote within 24 hours.",
    "أرسل استفساراً":"Send an inquiry",
    "نوع المشروع":"Project type",
    "تصميم/تشطيب فيلا":"Villa design/finishing",
    "تصميم/تشطيب شقة":"Apartment design/finishing",
    "تجاري / إداري":"Commercial / Administrative",
    "أخرى":"Other",
    "أرسل طلبك — نرد خلال ساعة":"Send your request — we reply within an hour",
    "أفضل مكتب تصميم داخلي وهندسي في مصر. خدمات متكاملة منذ 2015.":"The best interior design & engineering office in Egypt. Integrated services since 2015.",
    "تصميم تجاري":"Commercial Design",
    "💬 واتساب مباشر":"💬 Live WhatsApp",
    "📍 القاهرة، مصر":"📍 Cairo, Egypt"
  };
  var DG={"\u0660":"0","\u0661":"1","\u0662":"2","\u0663":"3","\u0664":"4","\u0665":"5","\u0666":"6","\u0667":"7","\u0668":"8","\u0669":"9","\u066c":",","\u066b":"."};
  function augment(){
    var els=document.querySelectorAll("a,button,span,li,option,p,h1,h2,h3,h4,th,td,label");
    for(var i=0;i<els.length;i++){ var el=els[i]; if(el.children.length!==0) continue; if(el.hasAttribute("data-en")) continue; var t=(el.textContent||"").replace(/\s+/g," ").trim(); if(DICT[t]){ el.setAttribute("data-ar",t); el.setAttribute("data-en",DICT[t]); } }
    var ins=document.querySelectorAll("input[placeholder],textarea[placeholder]");
    for(var j=0;j<ins.length;j++){ var e=ins[j]; if(e.getAttribute("data-en-placeholder")) continue; var p=(e.getAttribute("placeholder")||"").replace(/\s+/g," ").trim(); if(DICT[p]){ e.setAttribute("data-ar-placeholder",p); e.setAttribute("data-en-placeholder",DICT[p]); } }
  }
  function localizeNum(){ var w=document.createTreeWalker(document.body,NodeFilter.SHOW_TEXT,null),n; while(n=w.nextNode()){ var v=n.nodeValue; if(!v) continue; if(/[\u0660-\u0669]/.test(v) || v.indexOf("\u062c.\u0645")>=0){ var nv=v.replace(/[\u0660-\u0669\u066c\u066b]/g,function(c){return DG[c]||c;}).replace(/\u062c\.\u0645/g,"EGP"); if(nv!==v) n.nodeValue=nv; } } }
  var mo=null,tm=null;
  function apply(){ try{ if(mo) mo.disconnect(); augment(); if(typeof setLang==="function" && typeof currentLang!=="undefined"){ setLang(currentLang); if(currentLang==="en") localizeNum(); } }catch(e){} finally{ if(mo) mo.observe(document.body,{childList:true,subtree:true}); } }
  function start(){ apply(); try{ mo=new MutationObserver(function(){ clearTimeout(tm); tm=setTimeout(apply,350); }); mo.observe(document.body,{childList:true,subtree:true}); }catch(e){} }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded", start); else start();
})();
