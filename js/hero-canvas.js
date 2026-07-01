/* ==========================================================================
   Hero node-network animation
   Lightweight canvas 2D: drifting nodes + proximity links + mouse parallax.
   Honors prefers-reduced-motion and pauses when the tab is hidden.
   ========================================================================== */
(() => {
  const canvas = document.getElementById('heroCanvas');
  if (!canvas) return;

  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const ctx = canvas.getContext('2d', { alpha: true });

  const COLORS = { node: '#6f8bff', nodeBright: '#9b7bff', line: '27,76,193', accent: '108,43,217' };
  let W, H, DPR, nodes = [], raf = null, running = false;
  const mouse = { x: 0, y: 0, tx: 0, ty: 0 };

  const conf = () => {
    const area = W * H;
    return {
      count: Math.min(90, Math.max(28, Math.round(area / 22000))),
      linkDist: Math.min(190, Math.max(120, W / 9)),
    };
  };

  function resize() {
    DPR = Math.min(window.devicePixelRatio || 1, 2);
    const r = canvas.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * DPR; canvas.height = H * DPR;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    build();
  }

  function build() {
    const { count } = conf();
    nodes = Array.from({ length: count }, () => ({
      x: Math.random() * W,
      y: Math.random() * H,
      vx: (Math.random() - 0.5) * 0.28,
      vy: (Math.random() - 0.5) * 0.28,
      r: Math.random() * 1.8 + 0.7,
      bright: Math.random() > 0.82,
    }));
  }

  function step() {
    ctx.clearRect(0, 0, W, H);
    const { linkDist } = conf();

    // ease parallax
    mouse.x += (mouse.tx - mouse.x) * 0.06;
    mouse.y += (mouse.ty - mouse.y) * 0.06;
    const px = mouse.x * 26, py = mouse.y * 26;

    // links
    for (let i = 0; i < nodes.length; i++) {
      const a = nodes[i];
      for (let j = i + 1; j < nodes.length; j++) {
        const b = nodes[j];
        const dx = a.x - b.x, dy = a.y - b.y;
        const d = Math.hypot(dx, dy);
        if (d < linkDist) {
          const t = 1 - d / linkDist;
          ctx.strokeStyle = `rgba(${COLORS.line},${t * 0.5})`;
          ctx.lineWidth = t * 1.1;
          ctx.beginPath();
          ctx.moveTo(a.x + px * a.r * 0.5, a.y + py * a.r * 0.5);
          ctx.lineTo(b.x + px * b.r * 0.5, b.y + py * b.r * 0.5);
          ctx.stroke();
        }
      }
    }

    // nodes
    for (const n of nodes) {
      n.x += n.vx; n.y += n.vy;
      if (n.x < -20) n.x = W + 20; if (n.x > W + 20) n.x = -20;
      if (n.y < -20) n.y = H + 20; if (n.y > H + 20) n.y = -20;

      const ox = n.x + px * n.r * 0.5, oy = n.y + py * n.r * 0.5;
      if (n.bright) {
        const g = ctx.createRadialGradient(ox, oy, 0, ox, oy, n.r * 6);
        g.addColorStop(0, `rgba(${COLORS.accent},.9)`);
        g.addColorStop(1, `rgba(${COLORS.accent},0)`);
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(ox, oy, n.r * 6, 0, Math.PI * 2); ctx.fill();
      }
      ctx.fillStyle = n.bright ? COLORS.nodeBright : COLORS.node;
      ctx.beginPath(); ctx.arc(ox, oy, n.r, 0, Math.PI * 2); ctx.fill();
    }

    raf = requestAnimationFrame(step);
  }

  function start() { if (!running) { running = true; step(); } }
  function stop() { running = false; if (raf) cancelAnimationFrame(raf); raf = null; }

  // static single frame for reduced-motion users
  function paintStatic() { build(); step(); stop(); }

  window.addEventListener('resize', () => { clearTimeout(window.__hrz); window.__hrz = setTimeout(resize, 150); });
  window.addEventListener('mousemove', (e) => {
    mouse.tx = (e.clientX / window.innerWidth - 0.5) * 2;
    mouse.ty = (e.clientY / window.innerHeight - 0.5) * 2;
  }, { passive: true });

  document.addEventListener('visibilitychange', () => { document.hidden ? stop() : (!reduce && start()); });

  resize();
  if (reduce) paintStatic(); else start();
})();
