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
}

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
      style="position:absolute;right:1rem;top:50%;transform:translateY(-50%);font-family:'Cairo',sans-serif;font-size:1.05rem;font-weight:900;letter-spacing:.08em;text-decoration:none;white-space:nowrap;pointer-events:auto;z-index:2;line-height:1;display:flex;align-items:baseline;gap:0;">
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
