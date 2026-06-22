(function initCursor() {
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  document.documentElement.classList.add('custom-cursor-active');

  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';

  const TRAIL_COUNT = 10;
  const trails = Array.from({ length: TRAIL_COUNT }, () => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    return el;
  });

  document.body.append(dot, ring, ...trails);

  let mx = -300, my = -300;
  let rx = -300, ry = -300;

  /* 트레일 순환 버퍼 */
  const BUF = 60;
  const buf = Array.from({ length: BUF }, () => ({ x: -300, y: -300 }));
  let head = 0;

  let magnetTarget = null;

  const SEL_LINK = 'a, button, .btn, .nav-link, .drama-nav, .drama-dot, .popup-close-btn, .popup-watch-btn, .popup-wish-btn, .search-icon-btn, .search-close-btn, [data-filter]';
  const SEL_CARD = '.content-card, .drama-3d-card';
  const SEL_MAG  = '.btn, .nav-link';

  /* 마우스 이동 — 도트는 즉시 따라감 */
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    dot.style.transform = `translate3d(${mx}px,${my}px,0) translate(-50%,-50%)`;
  });

  document.addEventListener('mousedown', () => { ring.classList.add('cursor-click'); dot.classList.add('cursor-click'); });
  document.addEventListener('mouseup',   () => { ring.classList.remove('cursor-click'); dot.classList.remove('cursor-click'); });

  function applyState(el) {
    ring.classList.remove('state-link', 'state-card');
    if (!el) return;
    if (el.closest(SEL_CARD))      ring.classList.add('state-card');
    else if (el.closest(SEL_LINK)) ring.classList.add('state-link');
  }

  document.addEventListener('mouseover', (e) => {
    applyState(e.target);
    const magEl = e.target.closest(SEL_MAG);
    if (magEl) magnetTarget = magEl;
  });

  document.addEventListener('mouseout', (e) => {
    if (e.relatedTarget && e.target.contains(e.relatedTarget)) return;
    applyState(e.relatedTarget);
    if (magnetTarget && !magnetTarget.contains(e.relatedTarget)) {
      magnetTarget.style.transform = '';
      magnetTarget.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
      magnetTarget = null;
    }
  });

  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    trails.forEach(t => { t.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  /* rAF 루프 — ring은 lerp 0.22로 빠르게 추종, 트레일은 GPU 합성 */
  function tick() {
    rx += (mx - rx) * 0.22;
    ry += (my - ry) * 0.22;
    ring.style.transform = `translate3d(${rx}px,${ry}px,0) translate(-50%,-50%)`;

    buf[head] = { x: mx, y: my };
    head = (head + 1) % BUF;

    const STEP = 4;
    trails.forEach((el, i) => {
      const idx   = (head - 1 - i * STEP + BUF * (STEP + 1)) % BUF;
      const pos   = buf[idx];
      const ratio = 1 - i / TRAIL_COUNT;
      el.style.transform = `translate3d(${pos.x}px,${pos.y}px,0) translate(-50%,-50%) scale(${(ratio * 0.85 + 0.15).toFixed(3)})`;
      el.style.opacity   = (ratio * ratio * 0.4).toFixed(3);
    });

    if (magnetTarget) {
      const r    = magnetTarget.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = mx - cx, dy = my - cy;
      const dist = Math.hypot(dx, dy);
      const RANGE = 88;
      if (dist < RANGE) {
        const pull = (1 - dist / RANGE) * 0.38;
        magnetTarget.style.transform  = `translate(${(dx * pull).toFixed(1)}px,${(dy * pull).toFixed(1)}px)`;
        magnetTarget.style.transition = 'transform 0.08s linear';
      } else {
        magnetTarget.style.transform  = '';
        magnetTarget.style.transition = 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1)';
        magnetTarget = null;
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
