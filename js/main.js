/* ==========================================================================
   EvolveNXT - Daybreak
   One continuous story: a dark dawn sky that breaks into daylight as the
   user scrolls, resolving to the exact cream of the page. Then a pinned
   lifecycle in daylight and one dark product showcase. Reduced-motion aware.
   ========================================================================== */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => window.matchMedia('(min-width: 1001px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ============================== DAWN ============================== */
  // Filmic sky rendered on canvas. Scroll raises the light through night,
  // blue hour, and sunrise until the frame equals the page cream.
  function createDawn(canvas) {
    const ctx = canvas.getContext('2d', { alpha: false });
    let W = 0, H = 0, stars = [], raf = null, running = false;
    const st = { target: 0, p: 0 };

    // palette keyframes at progress stops
    const STOPS = [0, 0.45, 0.8, 1];
    const PAL = {
      top:     [[5,7,15],    [13,26,51],   [147,167,196], [243,239,231]],
      mid:     [[10,18,36],  [35,55,87],   [203,191,172], [243,239,231]],
      horizon: [[18,32,62],  [107,90,73],  [237,211,168], [243,239,231]],
      land:    [[3,5,10],    [11,18,32],   [181,169,143], [243,239,231]],
    };
    function seg(p) {
      let i = 0;
      while (i < STOPS.length - 2 && p > STOPS[i + 1]) i++;
      const t = (p - STOPS[i]) / (STOPS[i + 1] - STOPS[i] || 1);
      return [i, clamp(t, 0, 1)];
    }
    function col(name, p) {
      const [i, t] = seg(p);
      const a = PAL[name][i], b = PAL[name][i + 1];
      return `rgb(${Math.round(a[0] + (b[0] - a[0]) * t)},${Math.round(a[1] + (b[1] - a[1]) * t)},${Math.round(a[2] + (b[2] - a[2]) * t)})`;
    }
    const kf = (vals, p) => { const [i, t] = seg(p); return vals[i] + (vals[i + 1] - vals[i]) * t; };

    function resize() {
      const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      stars = Array.from({ length: 90 }, () => ({
        x: Math.random() * W, y: Math.random() * H * 0.62,
        r: Math.random() * 1.1 + 0.4, ph: Math.random() * 6.28, tw: 0.5 + Math.random() * 1.4,
      }));
    }

    function draw(now) {
      st.p += (st.target - st.p) * 0.06;           // eased: the scroll-jack feels fluid
      const p = st.p;
      const hy = H * 0.72;

      // sky
      const sky = ctx.createLinearGradient(0, 0, 0, hy);
      sky.addColorStop(0, col('top', p));
      sky.addColorStop(0.55, col('mid', p));
      sky.addColorStop(1, col('horizon', p));
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, W, hy + 1);

      // land
      ctx.fillStyle = col('land', p);
      ctx.fillRect(0, hy, W, H - hy);

      // stars fade out as light rises
      const sa = clamp(0.9 - p * 2.3, 0, 1);
      if (sa > 0.01) {
        for (const s of stars) {
          const tw = 0.55 + 0.45 * Math.sin(now * 0.0012 * s.tw + s.ph);
          ctx.fillStyle = `rgba(233,238,246,${(sa * 0.85 * tw).toFixed(3)})`;
          ctx.fillRect(s.x, s.y, s.r, s.r);
        }
      }

      // the sun: rises from below the horizon, diffuses into daylight
      const sunA = kf([0, 0.5, 0.34, 0], p);
      if (sunA > 0.01) {
        const sx = W * 0.62;
        const sy = hy + H * (0.12 - 0.3 * p);
        const R = H * (0.32 + p * 0.5);
        const g = ctx.createRadialGradient(sx, sy, 0, sx, sy, R);
        g.addColorStop(0, `rgba(246,216,158,${sunA})`);
        g.addColorStop(0.45, `rgba(238,196,140,${sunA * 0.4})`);
        g.addColorStop(1, 'rgba(238,196,140,0)');
        ctx.fillStyle = g;
        ctx.fillRect(0, 0, W, H);
      }

      // drifting atmosphere bands near the horizon
      const ma = (1 - p) * 0.12;
      if (ma > 0.01) {
        for (let i = 0; i < 3; i++) {
          const y = hy - H * (0.05 + i * 0.09);
          const x = ((now * (0.008 + i * 0.004)) % (W * 1.6)) - W * 0.3;
          ctx.save();
          ctx.translate(x, y); ctx.scale(5, 1);
          const g = ctx.createRadialGradient(0, 0, 0, 0, 0, H * 0.07);
          g.addColorStop(0, `rgba(178,196,222,${ma})`);
          g.addColorStop(1, 'rgba(178,196,222,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(0, 0, H * 0.07, 0, 6.29); ctx.fill();
          ctx.restore();
        }
      }
    }

    function frame(now) { draw(now); raf = requestAnimationFrame(frame); }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    resize();
    window.addEventListener('resize', () => { clearTimeout(canvas._rz); canvas._rz = setTimeout(resize, 160); });

    if (RM) { st.p = 0.35; st.target = 0.35; draw(0); return { setProgress() {} }; }

    draw(0); // paint the night immediately; never a black first frame

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(canvas);
    } else start();
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

    return { setProgress(p) { st.target = p; } };
  }

  const dawn = document.getElementById('dawn') ? createDawn(document.getElementById('dawn')) : null;

  /* ====================== ENTRANCE CHOREOGRAPHY ===================== */
  const title = document.querySelector('.hero__title');
  const enter = () => {
    if (title) title.classList.add('lit');
    document.querySelectorAll('[data-entrance]').forEach(el => el.classList.add('in'));
  };
  if (RM) enter();
  else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(enter); setTimeout(enter, 800); }
  else setTimeout(enter, 250);

  // statement lines reveal when they arrive
  const stmt = document.querySelector('.statement__text');
  if (stmt) {
    if (RM || !('IntersectionObserver' in window)) stmt.classList.add('lit');
    else new IntersectionObserver((es, o) => es.forEach(e => {
      if (e.isIntersecting) { stmt.classList.add('lit'); o.disconnect(); }
    }), { threshold: 0.5 }).observe(stmt);
  }

  /* =================== SCROLL: DAWN + LIFECYCLE ===================== */
  const hero = document.getElementById('hero');
  const heroCopy = document.getElementById('heroCopy');
  const cue = document.getElementById('heroCue');
  const nav = document.getElementById('nav');

  const flow = document.querySelector('.flow');
  const flowStage = document.getElementById('flowStage');
  const flowCopies = [...document.querySelectorAll('.flow__copy')];
  const lstates = [...document.querySelectorAll('.lstate')];
  const flowFill = document.getElementById('flowFill');
  let flowK = 0;

  let ticking = false;
  function onScroll() {
    ticking = false;
    const scrub = desktop() && !RM;

    // nav resolves to light once the page is in daylight
    const navAt = (hero && scrub)
      ? hero.offsetHeight - window.innerHeight * 0.85
      : window.innerHeight * 0.6;
    if (nav) nav.classList.toggle('is-light', window.scrollY > navAt);

    if (hero && scrub) {
      const range = hero.offsetHeight - window.innerHeight;
      const p = clamp(-hero.getBoundingClientRect().top / (range || 1), 0, 1);
      if (dawn) dawn.setProgress(p);
      if (heroCopy) {
        const fade = clamp(1 - p * 2.1, 0, 1);
        heroCopy.style.opacity = fade.toFixed(3);
        heroCopy.style.transform = `translateY(${(-p * 130).toFixed(1)}px)`;
        heroCopy.style.pointerEvents = fade < 0.15 ? 'none' : '';
      }
      if (cue) cue.style.opacity = String(clamp(1 - p * 6, 0, 1));
    }

    if (flow && flowStage && scrub) {
      const range = flow.offsetHeight - window.innerHeight;
      const p = clamp(-flow.getBoundingClientRect().top / (range || 1), 0, 1);
      const e = smooth(p);
      if (flowFill) flowFill.style.width = (e * 100).toFixed(1) + '%';
      const k = clamp(Math.floor(e * 7), 0, 6);
      if (k !== flowK) {
        flowK = k;
        flowCopies.forEach((c, i) => c.classList.toggle('is-active', i === k));
        lstates.forEach((s, i) => s.classList.toggle('is-active', i === k));
      }
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  /* ============== PLATFORM: list + dark showcase ==================== */
  const items = [...document.querySelectorAll('.pitem')];
  const cstates = [...document.querySelectorAll('.cstate')];
  const pCopies = [...document.querySelectorAll('.platform__copy')];
  const showcaseName = document.getElementById('showcaseName');
  const NAMES = ['Producer onboarding', 'Incentive compensation', 'Producer portal', 'Web enrollment', 'CRM & leads'];
  let active = 0;

  function setActive(i) {
    if (i === active) return;
    active = i;
    items.forEach((el, j) => {
      el.classList.toggle('is-active', j === i);
      el.setAttribute('aria-selected', String(j === i));
    });
    pCopies.forEach((el, j) => el.classList.toggle('is-active', j === i));
    cstates.forEach((el, j) => el.classList.toggle('is-active', j === i));
    if (showcaseName) showcaseName.textContent = NAMES[i];
  }
  items.forEach((el, i) => {
    el.addEventListener('click', () => setActive(i));
    if (FINE) el.addEventListener('mouseenter', () => setActive(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const n = (i + 1) % items.length; items[n].focus(); setActive(n); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i - 1 + items.length) % items.length; items[n].focus(); setActive(n); }
    });
  });

  // stagger the first showcase state when it enters view
  const showcaseEl = document.getElementById('showcase');
  if (showcaseEl && !RM && 'IntersectionObserver' in window) {
    const first = cstates[0];
    if (first) first.classList.remove('is-active');
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { cstates[active].classList.add('is-active'); so.disconnect(); }
    }), { threshold: 0.3 });
    so.observe(showcaseEl);
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
