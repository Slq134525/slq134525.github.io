/* HYDRA site interactions */
(function () {
  'use strict';

  /* ---------- particle field (hero) ---------- */
  const cv = document.getElementById('fx');
  if (cv && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const ctx = cv.getContext('2d');
    let W, H, pts = [], raf;
    const N = () => Math.min(90, Math.floor(innerWidth / 16));

    function size() {
      W = cv.width = cv.offsetWidth * devicePixelRatio;
      H = cv.height = cv.offsetHeight * devicePixelRatio;
    }
    function seed() {
      pts = Array.from({ length: N() }, () => ({
        x: Math.random() * W, y: Math.random() * H,
        vx: (Math.random() - .5) * .35, vy: (Math.random() - .5) * .35,
        r: (Math.random() * 1.4 + .4) * devicePixelRatio
      }));
    }
    function tick() {
      ctx.clearRect(0, 0, W, H);
      const D = 130 * devicePixelRatio;
      for (const p of pts) {
        p.x += p.vx; p.y += p.vy;
        if (p.x < 0 || p.x > W) p.vx *= -1;
        if (p.y < 0 || p.y > H) p.vy *= -1;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, 7);
        ctx.fillStyle = 'rgba(46,230,168,.55)';
        ctx.fill();
      }
      for (let i = 0; i < pts.length; i++)
        for (let j = i + 1; j < pts.length; j++) {
          const a = pts[i], b = pts[j];
          const dx = a.x - b.x, dy = a.y - b.y, d2 = dx * dx + dy * dy;
          if (d2 < D * D) {
            ctx.strokeStyle = 'rgba(46,230,168,' + (.14 * (1 - d2 / (D * D))).toFixed(3) + ')';
            ctx.lineWidth = devicePixelRatio * .6;
            ctx.beginPath(); ctx.moveTo(a.x, a.y); ctx.lineTo(b.x, b.y); ctx.stroke();
          }
        }
      raf = requestAnimationFrame(tick);
    }
    size(); seed(); tick();
    addEventListener('resize', () => { cancelAnimationFrame(raf); size(); seed(); tick(); });
  }

  /* ---------- copy buttons ---------- */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = document.querySelector(btn.getAttribute('data-copy'));
      navigator.clipboard.writeText(src.innerText.trim()).then(() => {
        const old = btn.textContent;
        btn.textContent = '✓';
        setTimeout(() => btn.textContent = old, 1400);
      });
    });
  });

  /* ---------- reveal on scroll ---------- */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach(el => io.observe(el));

  /* ---------- active nav link ---------- */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === here) a.classList.add('active');
  });

  /* ---------- year ---------- */
  const y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();
})();
