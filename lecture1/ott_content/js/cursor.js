(function initCursor() {
  /* ── 터치 기기에서 비활성화 ── */
  if ('ontouchstart' in window || navigator.maxTouchPoints > 0) return;

  document.documentElement.classList.add('custom-cursor-active');

  /* ── DOM 생성 ── */
  const dot  = document.createElement('div');
  const ring = document.createElement('div');
  dot.className  = 'cursor-dot';
  ring.className = 'cursor-ring';

  const TRAIL_COUNT = 14;
  const trails = Array.from({ length: TRAIL_COUNT }, () => {
    const el = document.createElement('div');
    el.className = 'cursor-trail';
    return el;
  });

  document.body.append(dot, ring, ...trails);

  /* ── 상태 변수 ── */
  let mx = -300, my = -300;
  let rx = -300, ry = -300;

  /* 트레일용 순환 버퍼 */
  const BUF = 90;
  const trailBuf = Array.from({ length: BUF }, () => ({ x: -300, y: -300 }));
  let head = 0;

  let magnetTarget = null;

  /* ── 선택자 ── */
  const SEL_LINK = [
    'a', 'button', '.btn', '.nav-link',
    '.drama-nav', '.drama-dot',
    '.popup-close-btn', '.popup-watch-btn',
    '[data-filter]',
  ].join(',');
  const SEL_CARD = '.content-card, .drama-3d-card';
  /* 자기장 대상: 헤더 버튼 + 히어로 CTA + 네비 링크만 */
  const SEL_MAG  = '.btn, .nav-link, .hero-cta-primary, .hero-cta-secondary';

  /* ── 마우스 이동 ── */
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX;
    my = e.clientY;
    /* 도트는 즉각 이동 */
    dot.style.left = mx + 'px';
    dot.style.top  = my + 'px';
  });

  /* ── 클릭 효과 ── */
  document.addEventListener('mousedown', () => {
    ring.classList.add('cursor-click');
    dot.classList.add('cursor-click');
  });
  document.addEventListener('mouseup', () => {
    ring.classList.remove('cursor-click');
    dot.classList.remove('cursor-click');
  });

  /* ── 호버 상태 감지 ── */
  function applyState(el) {
    ring.classList.remove('state-link', 'state-card');
    if (!el) return;
    if (el.closest(SEL_CARD))       ring.classList.add('state-card');
    else if (el.closest(SEL_LINK))  ring.classList.add('state-link');
  }

  document.addEventListener('mouseover', (e) => {
    applyState(e.target);
    const magEl = e.target.closest(SEL_MAG);
    if (magEl) magnetTarget = magEl;
  });

  document.addEventListener('mouseout', (e) => {
    /* relatedTarget이 같은 요소 안으로 이동하면 무시 */
    if (e.relatedTarget && e.target.contains(e.relatedTarget)) return;
    applyState(e.relatedTarget);

    if (magnetTarget && !magnetTarget.contains(e.relatedTarget)) {
      magnetTarget.style.transform = '';
      magnetTarget.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
      magnetTarget = null;
    }
  });

  /* ── 윈도우 진입·이탈 ── */
  document.addEventListener('mouseleave', () => {
    dot.style.opacity  = '0';
    ring.style.opacity = '0';
    trails.forEach(t => { t.style.opacity = '0'; });
  });
  document.addEventListener('mouseenter', () => {
    dot.style.opacity  = '1';
    ring.style.opacity = '1';
  });

  /* ── rAF 루프 ── */
  function tick() {
    /* 링 — lerp 추종 */
    rx += (mx - rx) * 0.12;
    ry += (my - ry) * 0.12;
    ring.style.left = rx + 'px';
    ring.style.top  = ry + 'px';

    /* 트레일 버퍼 기록 */
    trailBuf[head] = { x: mx, y: my };
    head = (head + 1) % BUF;

    /* 트레일 도트 배치 */
    const STEP = 5; // 버퍼 샘플 간격 (클수록 느린 트레일)
    trails.forEach((el, i) => {
      const idx   = (head - 1 - i * STEP + BUF * (STEP + 1)) % BUF;
      const pos   = trailBuf[idx];
      const ratio = 1 - i / TRAIL_COUNT;
      el.style.left      = pos.x + 'px';
      el.style.top       = pos.y + 'px';
      el.style.opacity   = (ratio * ratio * 0.45).toFixed(3);
      el.style.transform = `translate(-50%,-50%) scale(${(ratio * 0.9 + 0.1).toFixed(3)})`;
    });

    /* 자기장 효과 */
    if (magnetTarget) {
      const r    = magnetTarget.getBoundingClientRect();
      const cx   = r.left + r.width  / 2;
      const cy   = r.top  + r.height / 2;
      const dx   = mx - cx;
      const dy   = my - cy;
      const dist = Math.hypot(dx, dy);
      const RANGE = 88;

      if (dist < RANGE) {
        const pull = (1 - dist / RANGE) * 0.38;
        magnetTarget.style.transform  = `translate(${(dx * pull).toFixed(1)}px, ${(dy * pull).toFixed(1)}px)`;
        magnetTarget.style.transition = 'transform 0.08s linear';
      } else {
        magnetTarget.style.transform  = '';
        magnetTarget.style.transition = 'transform 0.5s cubic-bezier(0.34,1.56,0.64,1)';
        magnetTarget = null;
      }
    }

    requestAnimationFrame(tick);
  }

  requestAnimationFrame(tick);
})();
