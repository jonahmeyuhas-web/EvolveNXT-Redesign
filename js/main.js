/* ==========================================================================
   EvolveNXT - Interface Surfaces
   Product-led motion: a layered OS hero that drifts and settles with scroll,
   a pinned lifecycle whose interface state transforms per stage, and one
   product console. No canvas, no line-art. Reduced-motion aware.
   ========================================================================== */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => window.matchMedia('(min-width: 1001px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ====================== ENTRANCE CHOREOGRAPHY ===================== */
  const title = document.querySelector('.hero__title');
  const consoleEl = document.getElementById('heroConsole');
  const enter = () => {
    if (title) title.classList.add('lit');
    document.querySelectorAll('[data-entrance]').forEach(el => el.classList.add('in'));
    if (consoleEl) consoleEl.classList.add('in');
  };
  if (RM) enter();
  else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(enter); setTimeout(enter, 750); }
  else setTimeout(enter, 250);

  /* ================== SCROLL: HERO SETTLE + LIFECYCLE ================ */
  const hero = document.getElementById('hero');
  const heroCopy = document.getElementById('heroCopy');
  const cue = document.getElementById('heroCue');
  const nav = document.getElementById('nav');

  const flow = document.querySelector('.flow');
  const flowStage = document.getElementById('flowStage');
  const flowCopies = [...document.querySelectorAll('.flow__copy')];
  const lstates = [...document.querySelectorAll('.lstate')];
  const flowIndicator = document.getElementById('flowIndicator');
  let flowK = 0;

  let ticking = false;
  function onScroll() {
    ticking = false;
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    const scrub = desktop() && !RM;

    if (hero && scrub) {
      const range = hero.offsetHeight - window.innerHeight;
      const p = clamp(-hero.getBoundingClientRect().top / (range || 1), 0, 1);
      if (heroCopy) {
        const fade = clamp(1 - p * 1.5, 0, 1);
        heroCopy.style.opacity = fade.toFixed(3);
        heroCopy.style.transform = `translateY(${(-p * 80).toFixed(1)}px)`;
        heroCopy.style.pointerEvents = fade < 0.15 ? 'none' : '';
      }
      if (consoleEl) {
        // the surface eases toward center and lifts as the copy departs
        consoleEl.style.transform =
          `translateY(-50%) translateY(${(-p * 60).toFixed(1)}px) translateX(${(-p * 46).toFixed(1)}px)`;
        consoleEl.style.opacity = String(clamp(1 - p * 1.1, 0, 1));
      }
      if (cue) cue.style.opacity = String(clamp(1 - p * 5, 0, 1));
    }

    if (flow && flowStage && scrub) {
      const range = flow.offsetHeight - window.innerHeight;
      const p = clamp(-flow.getBoundingClientRect().top / (range || 1), 0, 1);
      const k = clamp(Math.floor(smooth(p) * 7), 0, 6);
      if (k !== flowK) {
        flowK = k;
        flowCopies.forEach((c, i) => c.classList.toggle('is-active', i === k));
        lstates.forEach((s, i) => s.classList.toggle('is-active', i === k));
        if (flowIndicator) flowIndicator.textContent = '0' + (k + 1) + ' / 07';
      }
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ================== SUITE: the product console ==================== */
  const items = [...document.querySelectorAll('.surface__item')];
  const cstates = [...document.querySelectorAll('.cstate')];
  const sCopies = [...document.querySelectorAll('.surface__copy')];
  const consoleName = document.getElementById('consoleName');
  const NAMES = ['Producer onboarding', 'Incentive compensation', 'Producer portal', 'Web enrollment', 'CRM & leads'];
  let active = 0;

  function setActive(i) {
    if (i === active) return;
    active = i;
    items.forEach((el, j) => {
      el.classList.toggle('is-active', j === i);
      el.setAttribute('aria-selected', String(j === i));
    });
    sCopies.forEach((el, j) => el.classList.toggle('is-active', j === i));
    cstates.forEach((el, j) => el.classList.toggle('is-active', j === i));
    if (consoleName) consoleName.textContent = NAMES[i];
  }
  items.forEach((el, i) => {
    el.addEventListener('click', () => setActive(i));
    if (FINE) el.addEventListener('mouseenter', () => setActive(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const n = (i + 1) % items.length; items[n].focus(); setActive(n); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i - 1 + items.length) % items.length; items[n].focus(); setActive(n); }
    });
  });

  // stagger the first console state in when the surface enters view
  const surfaceEl = document.querySelector('.surface');
  if (surfaceEl && !RM && 'IntersectionObserver' in window) {
    const first = cstates[0];
    if (first) first.classList.remove('is-active');
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { cstates[active].classList.add('is-active'); so.disconnect(); }
    }), { threshold: 0.3 });
    so.observe(surfaceEl);
  }

  /* ========================= SPARSE REVEALS ========================= */
  if (!RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }), { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('is-hidden'); io.observe(el);
      }
    });
  }

  /* ==================== NAV: spy + mobile menu ====================== */
  const links = [...document.querySelectorAll('.nav__links a')];
  const idFor = h => h && h.startsWith('#') ? document.getElementById(h.slice(1)) : null;
  const targets = links.map(a => idFor(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const spy = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) links.forEach(a => a.classList.toggle('is-active', idFor(a.getAttribute('href')) === e.target));
    }), { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t));
  }
  const toggle = document.getElementById('navToggle'), menu = document.getElementById('navLinks');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
      menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false');
    }));
  }
})();
