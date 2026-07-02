/* ==========================================================================
   EvolveNXT - Distribution OS
   Scroll-driven command-center hero (canvas network with moving connection
   pulses + lifecycle nodes that light on scroll), scrubbed lifecycle flow,
   entrance choreography, reveals. Vanilla JS. Reduced-motion aware.
   ========================================================================== */
(() => {
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const desktop = () => window.matchMedia('(min-width: 1001px)').matches;
  const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

  /* ========================= NETWORK CANVAS ========================= */
  // A calm "distribution command center": layered nodes, thin connection
  // lines, light pulses traveling the edges, and (optionally) 7 lifecycle
  // anchors that come online as scroll progress advances.
  function createNet(canvas, opts = {}) {
    const { density = 1, anchors = false, baseAlpha = 1, scrub = false } = opts;
    const ctx = canvas.getContext('2d', { alpha: false });
    let W = 0, H = 0, DPR = 1;
    let nodes = [], edges = [], pulses = [];
    let raf = null, running = false;
    const state = { p: 0, mx: 0, my: 0, emx: 0, emy: 0 };

    function build() {
      const count = Math.round(clamp((W * H) / 16000, 40, 110) * density);
      nodes = [];
      for (let i = 0; i < count; i++) {
        nodes.push({
          x: Math.random() * W,
          y: Math.random() * H,
          z: 0.35 + Math.random() * 0.65,          // depth for parallax
          ph: Math.random() * Math.PI * 2,          // idle drift phase
          anchor: -1,
        });
      }
      // lifecycle anchors along a gentle rising arc, biased right
      if (anchors) {
        for (let i = 0; i < 7; i++) {
          const t = i / 6;
          nodes.push({
            x: (0.16 + 0.72 * t) * W,
            y: (0.74 - 0.42 * t) * H + Math.sin(t * Math.PI) * H * 0.08,
            z: 1, ph: Math.random() * 6.28, anchor: i,
          });
        }
      }
      // edges: connect near neighbours (cap per node)
      edges = [];
      const maxD = Math.min(W, H) * 0.22;
      for (let i = 0; i < nodes.length; i++) {
        let links = 0;
        for (let j = i + 1; j < nodes.length && links < 3; j++) {
          const dx = nodes[i].x - nodes[j].x, dy = nodes[i].y - nodes[j].y;
          if (dx * dx + dy * dy < maxD * maxD) { edges.push([i, j]); links++; }
        }
      }
      // pulses: light traveling the connections
      const pn = Math.round(clamp(edges.length * 0.14, 8, 26) * density);
      pulses = Array.from({ length: pn }, () => ({
        e: (Math.random() * edges.length) | 0,
        t: Math.random(),
        s: 0.003 + Math.random() * 0.004,
        violet: Math.random() < 0.12,               // restrained purple
      }));
      ctx.fillStyle = '#05080F'; ctx.fillRect(0, 0, W, H);
    }

    function resize() {
      DPR = Math.min(window.devicePixelRatio || 1, 1.5);
      const r = canvas.getBoundingClientRect();
      W = Math.max(1, r.width); H = Math.max(1, r.height);
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      build();
    }

    const px = (n, now) => n.x + Math.sin(now * 0.0004 + n.ph) * 6 * n.z
      + (state.p * -70 + state.emx * 14) * n.z;
    const py = (n, now) => n.y + Math.cos(now * 0.00035 + n.ph) * 5 * n.z
      + (state.p * -34 + state.emy * 10) * n.z;

    function draw(now) {
      // eased mouse
      state.emx += (state.mx - state.emx) * 0.05;
      state.emy += (state.my - state.emy) * 0.05;

      // fade previous frame -> pulse trails
      ctx.fillStyle = 'rgba(5,8,15,0.22)';
      ctx.fillRect(0, 0, W, H);

      // slight zoom with progress
      const s = 1 + state.p * 0.06;
      ctx.save();
      ctx.translate(W / 2, H / 2); ctx.scale(s, s); ctx.translate(-W / 2, -H / 2);

      // edges
      for (const [a, b] of edges) {
        const na = nodes[a], nb = nodes[b];
        const z = (na.z + nb.z) / 2;
        ctx.strokeStyle = `rgba(90,130,190,${(0.05 + 0.08 * z) * baseAlpha})`;
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.moveTo(px(na, now), py(na, now));
        ctx.lineTo(px(nb, now), py(nb, now));
        ctx.stroke();
      }

      // base nodes
      for (const n of nodes) {
        if (n.anchor >= 0) continue;
        ctx.fillStyle = `rgba(124,160,215,${0.28 * n.z * baseAlpha})`;
        ctx.fillRect(px(n, now) - 0.9, py(n, now) - 0.9, 1.8, 1.8);
      }

      // pulses: the moving light on the connection lines
      for (const p of pulses) {
        p.t += p.s * (1 + state.p * 0.6);
        if (p.t > 1) { p.t = 0; p.e = (Math.random() * edges.length) | 0; }
        const [a, b] = edges[p.e];
        const na = nodes[a], nb = nodes[b];
        const x = px(na, now) + (px(nb, now) - px(na, now)) * p.t;
        const y = py(na, now) + (py(nb, now) - py(na, now)) * p.t;
        ctx.fillStyle = p.violet
          ? `rgba(139,124,246,${0.75 * baseAlpha})`
          : `rgba(124,199,255,${0.8 * baseAlpha})`;
        ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2);
      }

      // lifecycle anchors come online with scroll
      if (anchors) {
        for (const n of nodes) {
          if (n.anchor < 0) continue;
          const lit = scrub ? clamp(state.p * 8.2 - n.anchor, 0, 1) : 1;
          const x = px(n, now), y = py(n, now);
          const breathe = 0.75 + Math.sin(now * 0.002 + n.ph) * 0.25;
          if (lit > 0.02) {
            const r = 14 + lit * 10;
            const g = ctx.createRadialGradient(x, y, 0, x, y, r);
            g.addColorStop(0, `rgba(61,139,253,${0.3 * lit * breathe * baseAlpha})`);
            g.addColorStop(1, 'rgba(61,139,253,0)');
            ctx.fillStyle = g;
            ctx.beginPath(); ctx.arc(x, y, r, 0, 6.29); ctx.fill();
          }
          const c = 2.6 + lit * 1.2;
          ctx.fillStyle = lit > 0.02
            ? `rgba(${Math.round(124 + 100 * lit)},${Math.round(160 + 60 * lit)},255,${(0.5 + 0.5 * lit) * baseAlpha})`
            : `rgba(85,103,126,${0.6 * baseAlpha})`;
          ctx.fillRect(x - c / 2, y - c / 2, c, c);
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
      // static composition: fully-lit network, no motion loop
      state.p = 1;
      for (let i = 0; i < 36; i++) draw(i * 16);
      return { setProgress() {}, setMouse() {} };
    }

    if ('IntersectionObserver' in window) {
      new IntersectionObserver(es => es.forEach(e => e.isIntersecting ? start() : stop()), { threshold: 0 }).observe(canvas);
    } else start();
    document.addEventListener('visibilitychange', () => { document.hidden ? stop() : start(); });

    return {
      setProgress(p) { state.p = p; },
      setMouse(x, y) { state.mx = x; state.my = y; },
    };
  }

  const heroCanvas = document.getElementById('heroNet');
  const heroNet = heroCanvas ? createNet(heroCanvas, { anchors: true, scrub: true }) : null;
  const ctaCanvas = document.getElementById('ctaNet');
  if (ctaCanvas) createNet(ctaCanvas, { density: 0.5, baseAlpha: 0.7 });

  // subtle mouse parallax on the hero network
  if (heroNet && !RM && window.matchMedia('(hover: hover)').matches) {
    window.addEventListener('pointermove', (e) => {
      heroNet.setMouse(e.clientX / window.innerWidth - 0.5, e.clientY / window.innerHeight - 0.5);
    }, { passive: true });
  }

  /* ====================== ENTRANCE CHOREOGRAPHY ===================== */
  const title = document.querySelector('.hero__title');
  const enter = () => {
    if (title) title.classList.add('lit');
    document.querySelectorAll('[data-entrance]').forEach(el => el.classList.add('in'));
  };
  if (RM) enter();
  else if (document.fonts && document.fonts.ready) { document.fonts.ready.then(enter); setTimeout(enter, 700); }
  else setTimeout(enter, 250);

  /* ==================== SCROLL: HERO + FLOW SCRUB =================== */
  const hero = document.getElementById('hero');
  const cue = document.getElementById('heroCue');
  const panelWraps = [...document.querySelectorAll('.hero__panelwrap')];
  const flow = document.getElementById('flow');
  const osfill = document.getElementById('osfill');
  const osnodes = [...document.querySelectorAll('.osnode')];
  const nav = document.getElementById('nav');

  let ticking = false;
  function onScroll() {
    ticking = false;
    if (nav) nav.classList.toggle('is-scrolled', window.scrollY > 40);

    const scrubbing = desktop() && !RM;

    if (hero && scrubbing) {
      const range = hero.offsetHeight - window.innerHeight;
      const p = clamp(-hero.getBoundingClientRect().top / (range || 1), 0, 1);
      if (heroNet) heroNet.setProgress(p);
      panelWraps.forEach((w, i) => {
        w.style.transform = `translateY(${(-p * (46 + i * 34)).toFixed(1)}px)`;
      });
      if (cue) cue.style.opacity = String(clamp(1 - p * 4, 0, 1));
    }

    if (flow && scrubbing) {
      const range = flow.offsetHeight - window.innerHeight;
      const p = clamp(-flow.getBoundingClientRect().top / (range || 1), 0, 1);
      const e = p * p * (3 - 2 * p); // smoothstep: uses the full pin range
      if (osfill) osfill.style.width = (e * 100).toFixed(1) + '%';
      osnodes.forEach((n, i) => n.classList.toggle('on', e >= (i + 0.5) / 7));
    }
  }
  window.addEventListener('scroll', () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  // static fallbacks (mobile / reduced motion): light nodes as they appear
  if (!desktop() || RM) {
    if (osfill) osfill.style.width = '100%';
    if (RM || !('IntersectionObserver' in window)) {
      osnodes.forEach(n => n.classList.add('on'));
    } else {
      const fo = new IntersectionObserver(es => es.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('on'); fo.unobserve(e.target); }
      }), { threshold: 0.4 });
      osnodes.forEach(n => fo.observe(n));
    }
    if (heroNet) heroNet.setProgress(0.7); // network mostly online without scrub
  }

  /* ========================= SCROLL REVEALS ========================= */
  const reveals = [...document.querySelectorAll('[data-reveal]')];
  if (!RM && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting) { e.target.classList.add('in-view'); io.unobserve(e.target); }
    }), { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    reveals.forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('is-hidden'); io.observe(el);
      }
    });
  }

  /* ===================== NAV: spy + mobile menu ===================== */
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
