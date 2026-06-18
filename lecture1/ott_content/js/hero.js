(function initHeroCanvas() {
  const canvas = document.getElementById('hero-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  function resize() {
    canvas.width  = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }
  resize();
  window.addEventListener('resize', resize);

  const sparks = [];
  const embers = [];
  const SPARK_COLORS  = ['#E50914', '#FF4422', '#FF8C00', '#FFD700', '#ffffff'];
  const EMBER_COLORS  = ['#E50914', '#FF5500', '#FF8C00'];

  function burst() {
    const cx = canvas.width  / 2;
    const cy = canvas.height / 2;
    for (let i = 0; i < 48; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 2.5 + Math.random() * 7;
      sparks.push({
        x: cx, y: cy,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.016 + Math.random() * 0.016,
        size: 1.5 + Math.random() * 2.5,
        color: SPARK_COLORS[Math.floor(Math.random() * SPARK_COLORS.length)],
      });
    }
  }

  function addEmber() {
    embers.push({
      x: 40 + Math.random() * (canvas.width - 80),
      y: canvas.height + 4,
      vx: (Math.random() - 0.5) * 0.7,
      vy: -(0.5 + Math.random() * 1.4),
      life: 1,
      decay: 0.004 + Math.random() * 0.005,
      size: 0.8 + Math.random() * 1.6,
      color: EMBER_COLORS[Math.floor(Math.random() * EMBER_COLORS.length)],
    });
  }

  /* 최초 폭발은 BOOM! 입장 타이밍(0.75s)에 맞춤 */
  setTimeout(burst, 350);

  /* 3.5초마다 재폭발 */
  setInterval(burst, 3500);

  /* 엠버는 계속 올라옴 */
  setInterval(addEmber, 90);

  function tick() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.save();

    /* 스파크 */
    for (let i = sparks.length - 1; i >= 0; i--) {
      const p = sparks[i];
      p.x  += p.vx;
      p.y  += p.vy;
      p.vy += 0.14;    // 중력
      p.vx *= 0.97;
      p.life -= p.decay;
      if (p.life <= 0) { sparks.splice(i, 1); continue; }

      ctx.globalAlpha = p.life * p.life;
      ctx.fillStyle   = p.color;
      ctx.shadowBlur  = 10;
      ctx.shadowColor = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size * p.life, 0, Math.PI * 2);
      ctx.fill();
    }

    /* 엠버 */
    for (let i = embers.length - 1; i >= 0; i--) {
      const e = embers[i];
      e.x  += e.vx + (Math.random() - 0.5) * 0.3;
      e.y  += e.vy;
      e.life -= e.decay;
      if (e.life <= 0 || e.y < -10) { embers.splice(i, 1); continue; }

      ctx.globalAlpha = e.life * 0.65;
      ctx.fillStyle   = e.color;
      ctx.shadowBlur  = 5;
      ctx.shadowColor = e.color;
      ctx.beginPath();
      ctx.arc(e.x, e.y, e.size, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
    requestAnimationFrame(tick);
  }

  tick();
})();
