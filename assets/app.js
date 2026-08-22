/* HYDRA site interactions v2 */
(function () {
  'use strict';
  const RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ================= HYDRA HEADS CANVAS ================= */
  /* One core + 7 orbiting agent heads, linked by pulsing tendrils.
     Heads drift toward the cursor — the system reacts to you.       */
  const cv = document.getElementById('fx');
  if (cv && !RM) {
    const ctx = cv.getContext('2d');
    let W, H, raf, t = 0;
    const mouse = { x: .5, y: .42 };
    const HEADS = [
      { n: 'RECON',    c: '#00cc66' }, { n: 'HUNT', c: '#ff4444' },
      { n: 'VERIFY',   c: '#ffaa00' }, { n: 'REPORT', c: '#00aaff' },
      { n: 'PLAN',     c: '#00ff88' }, { n: 'AUDIT', c: '#ff8800' },
      { n: 'DEBUG',    c: '#ff00ff' }
    ];
    function size() { W = cv.width = cv.offsetWidth * devicePixelRatio; H = cv.height = cv.offsetHeight * devicePixelRatio; }
    function pos() {
      const cx = W * (.5 + (mouse.x - .5) * .06), cy = H * (.46 + (mouse.y - .42) * .06);
      const R = Math.min(W, H) * .30;
      return HEADS.map((h, i) => {
        const a = (i / 7) * Math.PI * 2 + t * .0011 + Math.sin(t * .0007 + i) * .18;
        return { x: cx + Math.cos(a) * R, y: cy + Math.sin(a) * R * .62, h };
      });
    }
    function tick() {
      t += 16;
      ctx.clearRect(0, 0, W, H);
      const dpr = devicePixelRatio;
      const heads = pos();
      const cx = W * (.5 + (mouse.x - .5) * .06), cy = H * (.46 + (mouse.y - .42) * .06);

      // ambient dust
      for (let i = 0; i < 40; i++) {
        const dx = ((i * 197 + t * .02 * (i % 3 + 1)) % W);
        const dy = ((i * 131 + t * .013 * (i % 2 + 1)) % H);
        ctx.fillStyle = 'rgba(140,170,200,.07)';
        ctx.fillRect(dx, dy, dpr, dpr);
      }

      // tendrils core->heads with travelling pulses
      heads.forEach((p, i) => {
        ctx.strokeStyle = 'rgba(46,230,168,.14)';
        ctx.lineWidth = dpr;
        ctx.beginPath(); ctx.moveTo(cx, cy); ctx.lineTo(p.x, p.y); ctx.stroke();
        // pulse position along the line, offset per head
        const ph = ((t * .0004) + i / 7) % 1;
        const px = cx + (p.x - cx) * ph, py = cy + (p.y - cy) * ph;
        ctx.beginPath(); ctx.arc(px, py, 2.2 * dpr, 0, 7);
        ctx.fillStyle = 'rgba(46,230,168,' + (.75 * Math.sin(ph * Math.PI)).toFixed(2) + ')';
        ctx.fill();
      });

      // faint ring between neighbours
      ctx.strokeStyle = 'rgba(88,166,255,.08)';
      ctx.beginPath();
      heads.forEach((p, i) => i ? ctx.lineTo(p.x, p.y) : ctx.moveTo(p.x, p.y));
      ctx.closePath(); ctx.stroke();

      // core
      const cg = ctx.createRadialGradient(cx, cy, 0, cx, cy, 26 * dpr);
      cg.addColorStop(0, 'rgba(46,230,168,.9)'); cg.addColorStop(1, 'rgba(46,230,168,0)');
      ctx.fillStyle = cg;
      ctx.beginPath(); ctx.arc(cx, cy, 26 * dpr, 0, 7); ctx.fill();
      ctx.fillStyle = '#eafff6';
      ctx.beginPath(); ctx.arc(cx, cy, 4.5 * dpr, 0, 7); ctx.fill();

      // heads
      heads.forEach(p => {
        const g = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, 16 * dpr);
        g.addColorStop(0, p.h.c); g.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.globalAlpha = .85;
        ctx.fillStyle = g;
        ctx.beginPath(); ctx.arc(p.x, p.y, 16 * dpr, 0, 7); ctx.fill();
        ctx.globalAlpha = 1;
        ctx.font = `${10 * dpr}px JetBrains Mono, monospace`;
        ctx.fillStyle = 'rgba(147,161,179,.75)';
        ctx.textAlign = 'center';
        ctx.fillText(p.h.n, p.x, p.y + 26 * dpr);
      });

      raf = requestAnimationFrame(tick);
    }
    let raf;
    cv.parentElement.addEventListener('mousemove', e => {
      const r = cv.getBoundingClientRect();
      mouse.x = (e.clientX - r.left) / r.width;
      mouse.y = (e.clientY - r.top) / r.height;
    });
    size(); tick();
    addEventListener('resize', () => { cancelAnimationFrame(raf); size(); tick(); });
  }

  /* ================= copy buttons ================= */
  document.querySelectorAll('[data-copy]').forEach(btn => {
    btn.addEventListener('click', () => {
      const src = document.querySelector(btn.getAttribute('data-copy'));
      navigator.clipboard.writeText(src.innerText.trim()).then(() => {
        const old = btn.textContent;
        btn.textContent = '✓ copied';
        setTimeout(() => btn.textContent = old, 1400);
      });
    });
  });

  /* ================= reveal + stagger ================= */
  const io = new IntersectionObserver(es => es.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('on'); io.unobserve(e.target); }
  }), { threshold: .12 });
  document.querySelectorAll('.rv').forEach((el, i) => {
    el.style.transitionDelay = (i % 4) * 60 + 'ms';
    io.observe(el);
  });

  /* ================= stat counters ================= */
  const cio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    cio.unobserve(e.target);
    const end = +e.target.dataset.count, el = e.target, t0 = performance.now();
    (function step(now) {
      const k = Math.min(1, (now - t0) / 1100);
      el.textContent = Math.round(end * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(step);
    })(t0);
  }), { threshold: .6 });
  document.querySelectorAll('[data-count]').forEach(el => cio.observe(el));

  /* ================= pipeline sequential glow ================= */
  const pio = new IntersectionObserver(es => es.forEach(e => {
    if (!e.isIntersecting) return;
    pio.unobserve(e.target);
    e.target.querySelectorAll('.flow-node').forEach((n, i) =>
      setTimeout(() => { n.classList.add('lit'); setTimeout(() => n.classList.remove('lit'), 1600); }, 500 + i * 550));
  }), { threshold: .35 });
  const fl = document.querySelector('.flow');
  if (fl) pio.observe(fl);

  /* ================= terminal demo typer ================= */
  const term = document.getElementById('term-body');
  if (term && !RM) {
    const LINES = [
      ['$ opencode', 'cmd'],
      ['> /hunt testphp.vulnweb.com', 'cmd'],
      ['', 'out'],
      ['[recon] resolving target… 3 subdomains · nginx/1.18 · PHP', 'out'],
      ['[recon] CDN check: origin direct — safe to scan', 'ok'],
      ['[hunter] probing 47 endpoints ……………… 6 leads saved', 'out'],
      ['[hunter] lead #3: /search.php?q= reflected payload survives encode', 'warn'],
      ['[verifier] replay ×3 · baseline diff · confidence 92%', 'ok'],
      ['[verifier] ✓ VERIFIED — Reflected XSS (CWE-79) CVSS 6.1', 'ok'],
      ['[reporter] BUGBASE_2026_reflected_xss_testphp.md written', 'out'],
      ['', 'out'],
      ['done in 4m 12s · 1 verified finding · report ready to submit', 'done']
    ];
    let li = 0, ci = 0, started = false;
    function type() {
      if (li >= LINES.length) {
        setTimeout(() => { term.innerHTML = ''; li = 0; ci = 0; type(); }, 6000);
        return;
      }
      const [txt, cls] = LINES[li];
      if (ci === 0) {
        const d = document.createElement('div');
        d.className = 'tl ' + cls;
        term.appendChild(d);
      }
      const cur = term.lastChild;
      cur.textContent = txt.slice(0, ++ci);
      if (ci >= txt.length) { li++; ci = 0; setTimeout(type, cls === 'cmd' ? 420 : 130); }
      else setTimeout(type, cls === 'cmd' ? 34 : 9);
    }
    const tio = new IntersectionObserver(es => es.forEach(e => {
      if (e.isIntersecting && !started) { started = true; tio.disconnect(); setTimeout(type, 350); }
    }), { threshold: .4 });
    tio.observe(term.closest('.demo'));
  }

  /* ================= active nav + year ================= */
  const here = location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    if (a.getAttribute('href') === here || (here.startsWith('index') && a.getAttribute('href')?.startsWith('index'))) a.classList.add('active');
  });
  const y = document.getElementById('yr');
  if (y) y.textContent = new Date().getFullYear();
})();
