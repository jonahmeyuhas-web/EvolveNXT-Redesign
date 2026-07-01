/* ==========================================================================
   Animated count-ups — trigger once when scrolled into view.
   Attributes: data-to, data-decimals, data-prefix, data-suffix, data-plain
   ========================================================================== */
(() => {
  const els = document.querySelectorAll('[data-counter]');
  if (!els.length) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  const fmt = (val, dec, plain) => {
    const n = dec ? val.toFixed(dec) : Math.round(val).toString();
    if (plain) return n;                       // e.g. year 2011 (no commas)
    const [int, frac] = n.split('.');
    const withSep = int.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
    return frac ? `${withSep}.${frac}` : withSep;
  };

  const render = (el, val) => {
    const dec = +el.dataset.decimals || 0;
    const plain = el.dataset.plain === '1';
    el.textContent = (el.dataset.prefix || '') + fmt(val, dec, plain) + (el.dataset.suffix || '');
  };

  const run = (el) => {
    const to = parseFloat(el.dataset.to);
    if (reduce) { render(el, to); return; }
    const dur = 1500, t0 = performance.now();
    const tick = (now) => {
      const p = Math.min((now - t0) / dur, 1);
      const eased = 1 - Math.pow(1 - p, 3);   // easeOutCubic
      render(el, to * eased);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };

  if (!('IntersectionObserver' in window)) { els.forEach(el => run(el)); return; }

  const io = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) { run(e.target); io.unobserve(e.target); }
    });
  }, { threshold: 0.4 });

  els.forEach(el => io.observe(el));
})();
