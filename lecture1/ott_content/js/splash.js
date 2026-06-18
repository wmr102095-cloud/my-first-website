(function initSplash() {
  /* 히어로 애니메이션 정지 + 숨김 */
  document.body.classList.add('splash-active');

  /* ── 오버레이 DOM 생성 ── */
  const overlay = document.createElement('div');
  overlay.id = 'boom-splash';

  const canvas = document.createElement('canvas');
  canvas.id = 'splash-canvas';

  const rings = document.createElement('div');
  rings.className = 'splash-rings';
  rings.innerHTML =
    '<div class="splash-ring r1"></div>' +
    '<div class="splash-ring r2"></div>' +
    '<div class="splash-ring r3"></div>';

  const inner = document.createElement('div');
  inner.className = 'splash-inner';
  inner.innerHTML = '<span class="splash-boom">BOOM<em class="splash-bang">!</em></span>';

  overlay.append(canvas, rings, inner);
  document.body.prepend(overlay);
  document.body.style.overflow = 'hidden';

  /* ── 캔버스 파티클 ── */
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();

  const particles = [];
  const COLORS = ['#E50914','#FF4422','#FF8C00','#FFD700','#ffffff','#ff8888'];

  function burst(cx, cy, count) {
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 4 + Math.random() * 11;
      particles.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.011 + Math.random() * 0.016,
        size: 2 + Math.random() * 4,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
      });
    }
  }

  setTimeout(() => burst(canvas.width / 2, canvas.height / 2, 90), 200);
  setTimeout(() => burst(canvas.width / 2, canvas.height / 2, 55), 900);

  let running = true;

  (function tick() {
    if (!running) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.2;
      p.vx *= 0.97;
      p.life -= p.decay;
      if (p.life <= 0) { particles.splice(i, 1); continue; }
      ctx.globalAlpha = p.life * p.life;
      ctx.fillStyle   = p.color;
      ctx.shadowBlur  = 14;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
    requestAnimationFrame(tick);
  })();

  /* ── 퇴장: 스플래시 BOOM!이 수축하며 사라지고, 히어로 BOOM!이 폭발 등장 ── */
  function doExit() {
    const boomEl = overlay.querySelector('.splash-boom');
    const bangEl = overlay.querySelector('.splash-bang');

    /* 스플래시 BOOM! 수축 퇴장 */
    boomEl.style.animation = 'splash-boom-out 0.6s ease-in forwards';
    bangEl.style.animation = 'splash-boom-out 0.55s ease-in forwards';
    overlay.style.animation = 'splash-overlay-out 0.7s ease-in forwards';

    /* 오버레이가 절반쯤 사라질 때 히어로 등장 시작 → 연속된 느낌 */
    setTimeout(() => {
      document.body.classList.remove('splash-active');
    }, 260);

    setTimeout(() => {
      running = false;
      overlay.remove();
      document.body.style.overflow = '';
    }, 700);
  }

  setTimeout(doExit, 2500);
})();
