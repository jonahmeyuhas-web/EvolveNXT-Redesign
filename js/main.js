/* ==========================================================================
   EvolveNXT - One Continuous System
   A living distribution network (labeled nodes, drifting flow, routes that
   draw with scroll, cursor-proximity light), a pinned lifecycle sequence,
   and one interactive product surface. Vanilla JS. Reduced-motion aware.
   ========================================================================== */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const FINE = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const desktop = () => window.matchMedia('(min-width: 1001px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
  const smooth = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };

  /* ============================ NETWORK ============================= */
  // The one visual system of the site. mode 'hero' adds labeled lifecycle
  // and entity nodes, scroll-drawn routes, and cursor-proximity lighting.
  const CHAIN = ['Onboard', 'Contract', 'Appoint', 'Place', 'Enroll', 'Compensate', 'Report'];
  const ENTITIES = ['Producer', 'Agency', 'Upline', 'Carrier', 'Audit trail', 'Commission rules', 'Portal activity'];

  function createNet(canvas, opts = {}) {
    const { mode = 'ambient', baseAlpha = 1, density = 1 } = opts;
    const ctx = canvas.getContext('2d', { alpha: false });
    let W = 0, H = 0, field = [], labeled = [], raf = null, running = false;
    const st = { p: 0, mx: -9999, my: -9999, emx: -9999, emy: -9999, hasMouse: false };

    function build() {
      const n = Math.round(clamp((W * H) / 17000, 40, 105) * density);
      field = Array.from({ length: n }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        z: 0.35 + Math.random() * 0.65,
        vx: 0.1 + Math.random() * 0.22,           // the flow: left to right
        ph: Math.random() * 6.28,
      }));
      labeled = [];
      if (mode === 'hero') {
        CHAIN.forEach((label, i) => {
          const t = i / 6;
          labeled.push({
            label, chain: i,
            hx: (0.08 + 0.84 * t) * W,
            hy: (0.66 - 0.34 * t) * H + Math.sin(t * Math.PI * 1.4) * H * 0.07,
            ph: Math.random() * 6.28,
          });
        });
        ENTITIES.forEach((label, i) => {
          labeled.push({
            label, chain: -1,
            hx: (0.1 + 0.8 * ((i * 0.37 + 0.15) % 1)) * W,
            hy: (0.14 + 0.72 * ((i * 0.61 + 0.08) % 1)) * H,
            ph: Math.random() * 6.28,
          });
        });
      }
      ctx.fillStyle = '#04070D'; ctx.fillRect(0, 0, W, H);
    }

    function resize() {
      const DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }

    const lx = (n, now) => n.hx + Math.sin(now * 0.00045 + n.ph) * 7 - st.p * 60;
    const ly = (n, now) => n.hy + Math.cos(now * 0.0004 + n.ph) * 6 - st.p * 26;
    // cursor proximity light: 0..1
    const near = (x, y) => {
      if (!st.hasMouse) return 0;
      const d = Math.hypot(x - st.emx, y - st.emy);
      return smooth(1 - d / 260);
    };

    function draw(now) {
      st.emx += (st.mx - st.emx) * 0.08;
      st.emy += (st.my - st.emy) * 0.08;

      ctx.fillStyle = 'rgba(4,7,13,0.26)';
      ctx.fillRect(0, 0, W, H);

      // perspective shift with scroll: slow zoom + slight rotation
      ctx.save();
      ctx.translate(W / 2, H / 2);
      ctx.rotate((st.p - 0.15) * 0.028);
      ctx.scale(1 + st.p * 0.07, 1 + st.p * 0.07);
      ctx.translate(-W / 2, -H / 2);

      // field motion + positions
      const pos = field.map(n => {
        n.x += n.vx; if (n.x > W + 20) n.x = -20;
        return [n.x - st.p * 90 * n.z, n.y + Math.sin(now * 0.0004 + n.ph) * 5 - st.p * 40 * n.z, n];
      });

      // proximity edges among field nodes
      const maxD = Math.min(W, H) * 0.2, maxD2 = maxD * maxD;
      for (let i = 0; i < pos.length; i++) {
        let links = 0;
        for (let j = i + 1; j < pos.length && links < 3; j++) {
          const dx = pos[i][0] - pos[j][0], dy = pos[i][1] - pos[j][1];
          const d2 = dx * dx + dy * dy;
          if (d2 < maxD2) {
            links++;
            const t = 1 - d2 / maxD2;
            const m = near((pos[i][0] + pos[j][0]) / 2, (pos[i][1] + pos[j][1]) / 2);
            ctx.strokeStyle = `rgba(${m > 0 ? 124 : 94},${m > 0 ? 199 : 124},${m > 0 ? 255 : 168},${(0.04 + 0.07 * t + 0.3 * m) * baseAlpha})`;
            ctx.lineWidth = 0.7 + m * 0.5;
            ctx.beginPath(); ctx.moveTo(pos[i][0], pos[i][1]); ctx.lineTo(pos[j][0], pos[j][1]); ctx.stroke();
          }
        }
      }

      // field dots
      for (const [x, y, n] of pos) {
        const m = near(x, y);
        ctx.fillStyle = `rgba(${126 + m * 100},${160 + m * 60},${215 + m * 40},${(0.24 * n.z + 0.55 * m) * baseAlpha})`;
        const r = 1.7 + m * 1.6;
        ctx.fillRect(x - r / 2, y - r / 2, r, r);
      }

      if (mode === 'hero') {
        // lifecycle routes draw across the system with scroll
        ctx.lineWidth = 1.1;
        for (let i = 0; i < 6; i++) {
          const a = labeled[i], b = labeled[i + 1];
          const seg = smooth(st.p * 7.2 - i);
          if (seg <= 0) continue;
          const ax = lx(a, now), ay = ly(a, now);
          const bx = lx(b, now), by = ly(b, now);
          ctx.strokeStyle = `rgba(124,199,255,${(0.28 + 0.25 * seg) * baseAlpha})`;
          ctx.beginPath(); ctx.moveTo(ax, ay);
          ctx.lineTo(ax + (bx - ax) * seg, ay + (by - ay) * seg); ctx.stroke();
        }

        // labeled nodes + small text labels
        ctx.font = '500 10px "Geist Mono", ui-monospace, monospace';
        for (const n of labeled) {
          const x = lx(n, now), y = ly(n, now);
          const m = near(x, y);
          const lit = n.chain >= 0 ? smooth(st.p * 7.2 - n.chain + 1) : 0;
          const glow = Math.max(m, lit * 0.7);
          if (glow > 0.03) {
            const rr = 12 + glow * 14;
            const g = ctx.createRadialGradient(x, y, 0, x, y, rr);
            g.addColorStop(0, `rgba(61,139,253,${0.28 * glow * baseAlpha})`);
            g.addColorStop(1, 'rgba(61,139,253,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, rr, 0, 6.29); ctx.fill();
          }
          const s = 3.4 + glow * 2;
          ctx.fillStyle = `rgba(${140 + glow * 90},${180 + glow * 50},255,${(0.55 + 0.45 * glow) * baseAlpha})`;
          ctx.fillRect(x - s / 2, y - s / 2, s, s);
          ctx.fillStyle = `rgba(195,205,220,${(0.34 + 0.5 * glow) * baseAlpha})`;
          ctx.fillText(n.label.toUpperCase(), x + 9, y - 7);
        }

        // soft cursor halo: the system lights where the mouse goes
        if (st.hasMouse) {
          const g = ctx.createRadialGradient(st.emx, st.emy, 0, st.emx, st.emy, 150);
          g.addColorStop(0, `rgba(94,124,168,${0.07 * baseAlpha})`);
          g.addColorStop(1, 'rgba(94,124,168,0)');
          ctx.fillStyle = g;
          ctx.beginPath(); ctx.arc(st.emx, st.emy, 150, 0, 6.29); ctx.fill();
        }
      }
      ctx.restore();
    }

    function frame(now) { draw(now); raf = requestAnimationFrame(frame); }
    function start() { if (!running) { running = true; raf = requestAnimationFrame(frame); } }
    function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

    resize();
    window.addEventListener('resize', () => { clearTimeout(canvas._rz); canvas._rz = setTimeout(resize, 160); });
    canvas.classList.add('on');

    if (RM) {
      st.p = 0.8;
      const paint = () => { for (let i = 0; i < 30; i++) draw(i * 16); };
      paint();
      if (document.fonts && document.fonts.ready) document.fonts.ready.then(paint);
      return { setProgress() {}, setMouse() {} };
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(canvas);
    } else start();
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

    return {
      setProgress(p) { st.p = p; },
      setMouse(x, y) {
        const r = canvas.getBoundingClientRect();
        st.mx = x - r.left; st.my = y - r.top; st.hasMouse = true;
        if (st.emx < -999) { st.emx = st.mx; st.emy = st.my; }
      },
    };
  }

  const heroNet = document.getElementById('heroNet')
    ? createNet(document.getElementById('heroNet'), { mode: 'hero' }) : null;
  const flowBg = document.getElementById('flowBg')
    ? createNet(document.getElementById('flowBg'), { density: 0.45, baseAlpha: 0.65 }) : null;
  if (document.getElementById('ctaNet'))
    createNet(document.getElementById('ctaNet'), { density: 0.4, baseAlpha: 0.6 });

  if (heroNet && FINE && !RM) {
    window.addEventListener('pointermove', e => heroNet.setMouse(e.clientX, e.clientY), { passive: true });
  }

  /* ======================= ENTRANCE CHOREOGRAPHY ==================== */
  const title = document.querySelector('.hero__title');
  const enter = () => {
    if (title) title.classList.add('lit');
    document.querySelectorAll('[data-entrance]').forEach(el => el.classList.add('in'));
  };
  if (RM) enter();
  else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(enter); setTimeout(enter, 750); }
  else setTimeout(enter, 250);

  /* ==================== FLOW: pinned lifecycle scrub ================ */
  const flow = document.querySelector('.flow');
  const flowStage = document.getElementById('flowStage');
  const flowPath = document.getElementById('flowPath');
  const flowMarks = document.getElementById('flowMarkers');
  const flowCopies = [...document.querySelectorAll('.flow__copy')];
  const railItems = [...document.querySelectorAll('#flowRail li')];
  let marks = [];

  function layoutMarkers() {
    if (!flowPath || !flowMarks || !desktop() || RM) return;
    const wrap = document.getElementById('flowCanvas');
    if (!wrap || !wrap.clientWidth) return;
    const L = flowPath.getTotalLength();
    if (!marks.length) {
      marks = CHAIN.map(label => {
        const el = document.createElement('div');
        el.className = 'fmark';
        el.innerHTML = '<span class="fmark__dot"></span><span class="fmark__label">' + label + '</span>';
        flowMarks.appendChild(el);
        return el;
      });
    }
    const sx = wrap.clientWidth / 1200, sy = wrap.clientHeight / 420;
    marks.forEach((el, i) => {
      const pt = flowPath.getPointAtLength(L * (0.04 + 0.92 * (i / 6)));
      el.style.left = (pt.x * sx) + 'px';
      el.style.top = (pt.y * sy) + 'px';
    });
  }

  /* ===================== ONE SCROLL HANDLER ========================= */
  const hero = document.getElementById('hero');
  const heroCopy = document.getElementById('heroCopy');
  const cue = document.getElementById('heroCue');
  const nav = document.getElementById('nav');
  let ticking = false;

  function onScroll() {
    ticking = false;
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);
    const scrub = desktop() && !RM;

    if (hero && scrub) {
      const range = hero.offsetHeight - window.innerHeight;
      const p = clamp(-hero.getBoundingClientRect().top / (range || 1), 0, 1);
      if (heroNet) heroNet.setProgress(p);
      if (heroCopy) {
        const fade = clamp(1 - p * 1.6, 0, 1);
        heroCopy.style.opacity = fade.toFixed(3);
        heroCopy.style.transform = `translateY(${(-p * 90).toFixed(1)}px)`;
        heroCopy.style.pointerEvents = fade < 0.15 ? 'none' : '';
      }
      if (cue) cue.style.opacity = String(clamp(1 - p * 5, 0, 1));
    }

    if (flow && flowStage && scrub) {
      const range = flow.offsetHeight - window.innerHeight;
      const p = clamp(-flow.getBoundingClientRect().top / (range || 1), 0, 1);
      const e = smooth(p);
      if (flowPath) flowPath.style.strokeDashoffset = String(1 - e);
      const k = clamp(Math.floor(e * 7), 0, 6);
      flowCopies.forEach((c, i) => c.classList.toggle('is-active', i === k));
      railItems.forEach((r, i) => r.classList.toggle('on', i <= k));
      marks.forEach((m, i) => m.classList.toggle('on', e * 7 >= i + 0.35));
      if (flowBg) flowBg.setProgress(k / 6);
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', () => { layoutMarkers(); onScroll(); });
  layoutMarkers(); onScroll();

  // non-scrub fallback: network partially alive without the pin
  if (!desktop() || RM) { if (heroNet) heroNet.setProgress(0.6); }

  /* ============== SUITE: one interactive product surface =========== */
  const items = [...document.querySelectorAll('.surface__item')];
  const scenes = [...document.querySelectorAll('.scene')];
  const sCopies = [...document.querySelectorAll('.surface__copy')];
  const view = document.getElementById('suiteView');
  let active = 0;

  function setActive(i) {
    if (i === active) return;
    active = i;
    items.forEach((el, j) => {
      el.classList.toggle('is-active', j === i);
      el.setAttribute('aria-selected', String(j === i));
    });
    sCopies.forEach((el, j) => el.classList.toggle('is-active', j === i));
    scenes.forEach(el => el.classList.remove('is-active'));
    if (view) void view.offsetWidth;           // restart the draw animation
    if (scenes[i]) scenes[i].classList.add('is-active');
  }
  // draw the first scene when the surface actually enters view
  const surfaceEl = document.querySelector('.surface');
  if (surfaceEl && view && !RM && 'IntersectionObserver' in window) {
    scenes.forEach(el => el.classList.remove('is-active'));
    const so = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { scenes[active].classList.add('is-active'); so.disconnect(); }
    }), { threshold: 0.3 });
    so.observe(surfaceEl);
  }

  items.forEach((el, i) => {
    el.addEventListener('click', () => setActive(i));
    if (FINE) el.addEventListener('mouseenter', () => setActive(i));
    el.addEventListener('keydown', (e) => {
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') { e.preventDefault(); const n = (i + 1) % items.length; items[n].focus(); setActive(n); }
      if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') { e.preventDefault(); const n = (i - 1 + items.length) % items.length; items[n].focus(); setActive(n); }
    });
  });

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
