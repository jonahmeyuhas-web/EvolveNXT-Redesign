/* ==========================================================================
   Interactions: nav, scroll progress, reveal-on-scroll, split headline,
   magnetic buttons, 3D tilt, marquee loop, mobile menu.
   All motion gated behind prefers-reduced-motion.
   ========================================================================== */
(() => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;

  /* ---- Nav: solid on scroll --------------------------------------- */
  const nav = document.getElementById('nav');
  const onScroll = () => {
    if (nav) nav.classList.toggle('is-solid', window.scrollY > 40);
    const bar = document.getElementById('scrollBar');
    if (bar) {
      const h = document.documentElement;
      const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
      bar.style.width = (p * 100).toFixed(2) + '%';
    }
  };
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

  /* ---- Split the hero headline into animatable words --------------- */
  document.querySelectorAll('[data-splitreveal]').forEach(el => {
    const words = el.textContent.trim().split(' ');
    el.innerHTML = words
      .map(w => `<span class="word"><span>${w}</span></span>`)
      .join(' ');
    // stagger each word
    el.querySelectorAll('.word > span').forEach((s, i) => { s.style.transitionDelay = (i * 0.06) + 's'; });
  });

  /* ---- Reveal on scroll ------------------------------------------- */
  const revealEls = document.querySelectorAll('[data-reveal], [data-splitreveal]');
  if (reduce || !('IntersectionObserver' in window)) {
    revealEls.forEach(el => el.classList.add('is-in'));
  } else {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => {
        if (e.isIntersecting) { e.target.classList.add('is-in'); io.unobserve(e.target); }
      });
    }, { threshold: 0.15, rootMargin: '0px 0px -8% 0px' });
    revealEls.forEach(el => io.observe(el));
  }

  /* ---- Marquee: duplicate for a seamless loop --------------------- */
  const track = document.getElementById('marqueeTrack');
  if (track) track.innerHTML += track.innerHTML;

  if (reduce) return; // everything below is pure enhancement

  /* ---- Magnetic buttons ------------------------------------------- */
  if (!isTouch) {
    document.querySelectorAll('.magnetic').forEach(btn => {
      const strength = 0.35;
      btn.addEventListener('mousemove', (e) => {
        const r = btn.getBoundingClientRect();
        const mx = e.clientX - r.left - r.width / 2;
        const my = e.clientY - r.top - r.height / 2;
        btn.style.transform = `translate(${mx * strength}px, ${my * strength}px)`;
      });
      btn.addEventListener('mouseleave', () => { btn.style.transform = ''; });
    });

    /* ---- 3D tilt on cards ---------------------------------------- */
    document.querySelectorAll('.tilt').forEach(card => {
      const max = 6;
      card.addEventListener('mousemove', (e) => {
        const r = card.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width - 0.5;
        const py = (e.clientY - r.top) / r.height - 0.5;
        card.style.transform = `perspective(900px) rotateX(${-py * max}deg) rotateY(${px * max}deg) translateY(-4px)`;
      });
      card.addEventListener('mouseleave', () => { card.style.transform = ''; });
    });
  }
})();
