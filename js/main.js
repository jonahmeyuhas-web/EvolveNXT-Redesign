/* ==========================================================================
   EvolveNXT — Assurance Engine
   Flow-field hero, live commission panel, scroll-pinned pipeline, reveals,
   count-ups, magnetic CTAs. All motion honors prefers-reduced-motion.
   ========================================================================== */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const lerp = (a, b, t) => a + (b - a) * t;

  /* ============================ FLOW FIELD ============================ */
  function colorFor(t) {
    // navy -> royal -> purple across x
    const stops = [[36, 58, 130], [27, 76, 193], [108, 43, 217]];
    let c1, c2, k;
    if (t < 0.5) { c1 = stops[0]; c2 = stops[1]; k = t / 0.5; }
    else { c1 = stops[1]; c2 = stops[2]; k = (t - 0.5) / 0.5; }
    return `rgba(${Math.round(lerp(c1[0], c2[0], k))},${Math.round(lerp(c1[1], c2[1], k))},${Math.round(lerp(c1[2], c2[2], k))},0.55)`;
  }

  function runField(canvas, { fadeTo = 1 } = {}) {
    const ctx = canvas.getContext('2d', { alpha: true });
    let W, H, DPR, parts = [], raf = null, running = false;

    const count = () => {
      const base = (window.innerWidth <= 680) ? 320 : 820;
      return Math.min(base, Math.max(240, Math.round((W * H) / 2400)));
    };
    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = Math.max(1, W * DPR); canvas.height = Math.max(1, H * DPR);
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      parts = Array.from({ length: count() }, () => ({ x: Math.random() * W, y: Math.random() * H }));
      ctx.fillStyle = '#020838'; ctx.fillRect(0, 0, W, H);
    }
    const SP = 0.5, S = 0.0016;
    function angle(x, y, t) {
      return (Math.sin(x * S + t * 0.00018) + Math.cos(y * S * 1.15 - t * 0.00014) + Math.sin((x + y) * S * 0.55 + t * 0.0001)) * Math.PI;
    }
    function frame(now) {
      ctx.fillStyle = 'rgba(2,8,56,0.14)';
      ctx.fillRect(0, 0, W, H);
      for (const p of parts) {
        const a = angle(p.x, p.y, now);
        p.x += Math.cos(a) * SP; p.y += Math.sin(a) * SP;
        if (p.x < 0) p.x += W; else if (p.x > W) p.x -= W;
        if (p.y < 0) p.y += H; else if (p.y > H) p.y -= H;
        ctx.fillStyle = colorFor(p.x / W);
        ctx.fillRect(p.x, p.y, 1.4, 1.4);
      }
      raf = requestAnimationFrame(frame);
    }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    resize();
    window.addEventListener('resize', () => { clearTimeout(canvas._rz); canvas._rz = setTimeout(resize, 160); });

    if (RM) {
      for (let i = 0; i < 60; i++) frame(i * 16);
      stop(); canvas.style.opacity = String(Math.min(fadeTo, 0.18) || 0.16);
      return;
    }
    // fade in
    requestAnimationFrame(() => { canvas.style.opacity = String(fadeTo); });
    // pause when offscreen / tab hidden
    if ('IntersectionObserver' in window) {
      new IntersectionObserver((es) => {
        es.forEach(e => e.isIntersecting ? start() : stop());
      }, { threshold: 0 }).observe(canvas);
    } else start();
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });
  }

  const hero = document.getElementById('flowField');
  if (hero) runField(hero, { fadeTo: 1 });
  const finalF = document.getElementById('finalField');
  if (finalF) runField(finalF, { fadeTo: 0.18 });

  /* ============================== BOOT =============================== */
  (function boot() {
    const bar = document.getElementById('bootBar'), num = document.getElementById('bootNum'), wrap = document.getElementById('boot');
    if (!bar || !num || !wrap) return;
    if (RM) { wrap.style.display = 'none'; return; }
    const dur = 720, t0 = performance.now();
    const tick = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      bar.style.width = (p * 100) + '%';
      num.textContent = String(Math.round(p * 100)).padStart(2, '0');
      if (p < 1) requestAnimationFrame(tick);
      else { wrap.style.transition = 'opacity .5s'; wrap.style.opacity = '0'; }
    };
    requestAnimationFrame(tick);
  })();

  /* ========================= COUNT-UP HELPER ========================= */
  const fmt = (v, dec) => {
    const n = dec ? v.toFixed(dec) : Math.round(v).toString();
    const [i, f] = n.split('.');
    const g = i.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return f ? `${g}.${f}` : g;
  };
  function countUp(el, dur = 1300) {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.decimals || 0;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (RM) { el.textContent = pre + fmt(to, dec) + suf; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = clamp((now - t0) / dur, 0, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e, dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ===================== HERO TITLE MASK REVEAL ===================== */
  const heroTitle = document.querySelector('.hero__title');
  if (heroTitle) {
    const lit = () => heroTitle.classList.add('lit');
    if (RM) lit();
    else if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(lit); setTimeout(lit, 600);
    } else setTimeout(lit, 200);
  }

  /* ==================== ENGINE PANEL SELF-ASSEMBLY ================== */
  const engine = document.getElementById('engine');
  if (engine) {
    const fig = engine.querySelector('[data-counter]');
    const chip = document.getElementById('calcChip');
    const play = () => {
      engine.classList.add('is-live');
      if (RM) { if (fig) countUp(fig); if (chip) chip.classList.add('pop'); return; }
      setTimeout(() => { if (fig) countUp(fig, 1200); }, 700);
      setTimeout(() => { if (chip) chip.classList.add('pop'); }, 1750);
    };
    play();
    // idle "runs" re-count so it feels live
    if (!RM) {
      const idle = engine.querySelector('[data-idle]');
      if (idle) {
        let base = +idle.dataset.base || 0;
        setInterval(() => {
          base += Math.floor(Math.random() * 3) + 1;
          idle.textContent = base.toLocaleString() + (idle.dataset.suffix || '');
        }, 5200);
      }
    }
  }

  /* ===================== REVEALS + IN-VIEW HOOKS ==================== */
  const stats = [...document.querySelectorAll('.stat')];
  const barW = [80, 94, 62, 99];
  function onInView(el) {
    el.classList.add('in-view');
    el.querySelectorAll('[data-fill]').forEach(f => { f.style.width = f.dataset.fill + '%'; });
    const si = stats.indexOf(el);
    if (si > -1) { const b = el.querySelector('[data-bar]'); if (b) b.style.width = (barW[si] || 80) + '%'; }
    el.querySelectorAll('[data-counter]').forEach(c => { if (!c.closest('#engine')) countUp(c); });
  }
  const revealEls = [...document.querySelectorAll('[data-reveal]'), ...document.querySelectorAll('.final__title')];
  if (RM || !('IntersectionObserver' in window)) {
    revealEls.forEach(onInView);
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { onInView(e.target); io.unobserve(e.target); } });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => {
      if (el.hasAttribute('data-reveal') && el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('is-hidden'); io.observe(el);
      } else if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        io.observe(el);
      } else {
        onInView(el);
      }
    });
  }

  /* ======================= SCROLL-PINNED PIPELINE ================== */
  const pipe = document.getElementById('pipeline');
  if (pipe) {
    const stages = [...pipe.querySelectorAll('.stage')];
    const rail = document.getElementById('railFill');
    const paid = document.getElementById('flowPaid');
    const n = stages.length;
    let paidDone = false;
    const setPaid = () => { if (paid && !paidDone) { paidDone = true; paid.dataset.to = '4182.50'; paid.dataset.prefix = '$'; paid.dataset.decimals = '2'; countUp(paid); } };
    const pinned = window.matchMedia('(min-width:1001px)').matches && !RM;

    if (!pinned) {
      stages.forEach(s => s.classList.add('active'));
      if (rail) rail.style.width = '100%';
      setPaid();
    } else {
      let ticking = false;
      const update = () => {
        ticking = false;
        const total = pipe.offsetHeight - window.innerHeight;
        const p = clamp((0 - pipe.getBoundingClientRect().top) / (total || 1), 0, 1);
        if (rail) rail.style.width = (p * 100).toFixed(1) + '%';
        stages.forEach((s, i) => s.classList.toggle('active', p >= (i / (n - 1)) - 0.06));
        if (p > 0.92) setPaid();
      };
      window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
      window.addEventListener('resize', update); update();
    }
  }

  /* ============================ NAV STATE =========================== */
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 40);
  window.addEventListener('scroll', onScroll, { passive: true }); onScroll();

  // active link highlight
  const links = [...document.querySelectorAll('.nav__links a')];
  const idFor = h => h && h.startsWith('#') ? document.getElementById(h.slice(1)) : null;
  const targets = links.map(a => idFor(a.getAttribute('href'))).filter(Boolean);
  if ('IntersectionObserver' in window && targets.length) {
    const spy = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          links.forEach(a => a.classList.toggle('is-active', idFor(a.getAttribute('href')) === e.target));
        }
      });
    }, { rootMargin: '-45% 0px -50% 0px' });
    targets.forEach(t => spy.observe(t));
  }

  /* =========================== MOBILE MENU ========================== */
  const toggle = document.getElementById('navToggle'), menu = document.getElementById('navLinks');
  if (toggle && menu) {
    toggle.addEventListener('click', () => {
      const open = menu.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    menu.querySelectorAll('a').forEach(a => a.addEventListener('click', () => { menu.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); }));
  }

  /* ========================= AUDIENCE SWITCHER ===================== */
  document.querySelectorAll('.switcher').forEach(sw => {
    const pills = [...sw.querySelectorAll('.switcher__pill')];
    pills.forEach(p => p.addEventListener('click', () => {
      pills.forEach(x => { x.classList.remove('is-active'); x.setAttribute('aria-selected', 'false'); });
      p.classList.add('is-active'); p.setAttribute('aria-selected', 'true');
    }));
  });

  /* ============================ MARQUEE ============================ */
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  /* ========================== MAGNETIC CTA ======================== */
  if (!isTouch && !RM) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      btn.addEventListener('pointermove', (e) => {
        const r = btn.getBoundingClientRect();
        btn.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.22}px, ${(e.clientY - r.top - r.height / 2) * 0.22}px)`;
      });
      btn.addEventListener('pointerleave', () => { btn.style.transform = ''; });
    });
  }
})();
