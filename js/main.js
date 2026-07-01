/* ==========================================================================
   EvolveNXT - interactions
   Restrained by design: nav state, mobile menu, scroll reveals,
   and one orchestrated "record posting" sequence. Reduced-motion aware.
   ========================================================================== */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---- Nav shadow on scroll --------------------------------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => nav && nav.classList.toggle('is-scrolled', window.scrollY > 8);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  /* ---- Mobile menu ------------------------------------------------- */
  const toggle = document.getElementById('navToggle');
  const links = document.querySelector('.nav__links');
  if (toggle && links) {
    toggle.addEventListener('click', () => {
      const open = links.classList.toggle('is-open');
      toggle.setAttribute('aria-expanded', String(open));
    });
    links.querySelectorAll('a').forEach(a =>
      a.addEventListener('click', () => { links.classList.remove('is-open'); toggle.setAttribute('aria-expanded', 'false'); })
    );
  }

  /* ---- Reveal on scroll (progressive enhancement) ----------------- */
  /* Content is visible by default. Only elements that START below the fold
     get hidden and animated in, so the page is never stuck blank regardless
     of initial scroll position or JS timing. */
  const revealEls = document.querySelectorAll('[data-reveal]');
  if (!reduce && 'IntersectionObserver' in window) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); } });
    }, { threshold: 0.16, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => {
      if (el.getBoundingClientRect().top > window.innerHeight * 0.92) {
        el.classList.add('is-hidden');
        io.observe(el);
      }
    });
  }

  /* ---- Count-up (tabular) ----------------------------------------- */
  const fmt = (v, dec) => {
    const n = dec ? v.toFixed(dec) : Math.round(v).toString();
    const [int, frac] = n.split('.');
    const grouped = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return frac ? `${grouped}.${frac}` : grouped;
  };
  const countUp = (el, dur = 1100) => {
    const to = parseFloat(el.dataset.to), dec = +el.dataset.decimals || 0;
    const pre = el.dataset.prefix || '', suf = el.dataset.suffix || '';
    if (reduce) { el.textContent = pre + fmt(to, dec) + suf; return; }
    const t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const e = 1 - Math.pow(1 - p, 3);
      el.textContent = pre + fmt(to * e, dec) + suf;
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  /* ---- Signature: the record posts, tallies, and reconciles ------- */
  const record = document.getElementById('record');
  if (record) {
    const lines = [...record.querySelectorAll('.record__line')].sort(
      (a, b) => (+a.dataset.post) - (+b.dataset.post)
    );
    const total = record.querySelector('[data-counter]');
    const stamp = document.getElementById('recStamp');

    const setTotal = () => {
      if (!total) return;
      const to = parseFloat(total.dataset.to), dec = +total.dataset.decimals || 0;
      total.textContent = (total.dataset.prefix || '') + fmt(to, dec) + (total.dataset.suffix || '');
    };
    const showFinal = () => {
      lines.forEach(l => l.classList.add('posted'));
      setTotal();
      if (stamp) stamp.classList.add('stamped');
    };
    const animate = () => {
      record.classList.add('is-animating');
      lines.forEach((l, i) => setTimeout(() => l.classList.add('posted'), 240 + i * 180));
      const afterLines = 240 + lines.length * 180 + 120;
      if (total) setTimeout(() => countUp(total), afterLines);
      if (stamp) setTimeout(() => stamp.classList.add('stamped'), afterLines + 900);
    };

    if (reduce || !('IntersectionObserver' in window)) { showFinal(); }
    else {
      const r = record.getBoundingClientRect();
      if (r.top < window.innerHeight && r.bottom > 0) { animate(); }
      else if (r.bottom <= 0) { showFinal(); }
      else {
        const ro = new IntersectionObserver((entries) => {
          entries.forEach(e => { if (e.isIntersecting) { animate(); ro.disconnect(); } });
        }, { threshold: 0.35 });
        ro.observe(record);
      }
    }
  }
})();
