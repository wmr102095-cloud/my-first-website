let allContents = [];
let activeType = '전체';
let activeGenre = '전체';

const GRADIENTS = [
  'linear-gradient(135deg,#E50914,#8b0000)',
  'linear-gradient(135deg,#1a1aff,#6a0dad)',
  'linear-gradient(135deg,#ff6b00,#cc0000)',
  'linear-gradient(135deg,#00897b,#004d40)',
  'linear-gradient(135deg,#7b1fa2,#4a148c)',
  'linear-gradient(135deg,#1565c0,#0d47a1)',
  'linear-gradient(135deg,#c62828,#6d4c41)',
  'linear-gradient(135deg,#2e7d32,#1b5e20)',
  'linear-gradient(135deg,#ad1457,#880e4f)',
  'linear-gradient(135deg,#e65100,#bf360c)',
];

async function fetchDramas() {
  const { data } = await db
    .from('ott_contents')
    .select('*')
    .eq('content_type', '드라마')
    .order('rating', { ascending: false });

  renderDramaCarousel(data || []);
}

function renderDramaCarousel(dramas) {
  const scene   = document.getElementById('drama-scene');
  const wrap    = document.querySelector('.drama-carousel-3d-wrap');
  const section = scene.closest('.drama-section');
  if (!dramas.length) { section.style.display = 'none'; return; }

  const n         = dramas.length;
  const TAU       = 2 * Math.PI;
  const angleStep = TAU / n;
  const radius    = Math.max(260, Math.round((n * 185) / TAU));

  /* ── 카드 생성 ── */
  scene.innerHTML = dramas.map((c, i) => {
    const grad   = GRADIENTS[i % GRADIENTS.length];
    const thumb  = c.thumbnail_url
      ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallback = `<div class="drama-3d-card-fallback"
        style="background:${grad};${c.thumbnail_url ? 'display:none':''}">
        ${esc(c.title.charAt(0))}</div>`;
    const genreYear = [c.genre, c.release_year].filter(Boolean).join(' · ');
    const ratingVal = c.rating > 0 ? Number(c.rating).toFixed(1) : '';
    const descShort = c.description ? c.description.slice(0, 55) + (c.description.length > 55 ? '…' : '') : '';

    return `
      <div class="drama-3d-card" data-id="${c.id}" data-idx="${i}">
        ${thumb}${fallback}
        <div class="drama-3d-card-overlay">
          <div class="drama-3d-card-title">${esc(c.title)}</div>
          ${ratingVal ? `<div class="drama-3d-card-rating">⭐ ${ratingVal}</div>` : ''}
        </div>
        <div class="drama-3d-card-hover-detail">
          <div class="hd-genre">${esc(genreYear)}</div>
          <div class="hd-title">${esc(c.title)}</div>
          ${ratingVal ? `<div class="hd-rating">⭐ ${ratingVal} / 10</div>` : ''}
          ${descShort ? `<div class="hd-desc">${esc(descShort)}</div>` : ''}
        </div>
      </div>`;
  }).join('');

  /* ── 좌우 화살표 ── */
  const leftBtn  = Object.assign(document.createElement('button'), { className: 'drama-nav drama-nav-left',  innerHTML: '&#8249;', type: 'button' });
  const rightBtn = Object.assign(document.createElement('button'), { className: 'drama-nav drama-nav-right', innerHTML: '&#8250;', type: 'button' });
  wrap.append(leftBtn, rightBtn);

  /* ── 도트 인디케이터 ── */
  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'drama-dots';
  dotsWrap.innerHTML = dramas.map((_, i) =>
    `<button class="drama-dot${i === 0 ? ' active' : ''}" data-dot="${i}" type="button"></button>`
  ).join('');
  section.appendChild(dotsWrap);

  /* ── 각도 정규화 헬퍼 (-π ~ π) ── */
  function norm(a) {
    a = a % TAU;
    if (a >  Math.PI) a -= TAU;
    if (a < -Math.PI) a += TAU;
    return a;
  }

  /* ── 상태 ── */
  const cards      = Array.from(scene.querySelectorAll('.drama-3d-card'));
  const dots       = Array.from(dotsWrap.querySelectorAll('.drama-dot'));
  let targetIdx    = 0;
  let currentAngle = 0;   // 항상 norm() 정규화 상태 유지
  let targetAngle  = 0;
  let hoveredIdx   = -1;
  let isDragging   = false;
  let dragStartX   = 0;
  let dragAngleStart = 0;
  let autoTimer;

  /* ── 카드 이동 (정규화 각도 기반) ── */
  function goTo(idx, withTimer = true) {
    targetIdx = ((idx % n) + n) % n;

    // 목표 각도 (정규화)
    const exact = norm(-targetIdx * angleStep);
    // 현재 각도도 정규화해서 최단 경로 계산
    const curr  = norm(currentAngle);
    let   diff  = norm(exact - curr);

    // currentAngle 과 targetAngle 모두 정규화 기준으로 리셋 → 오차 누적 방지
    currentAngle = curr;
    targetAngle  = curr + diff;

    dots.forEach((d, i) => d.classList.toggle('active', i === targetIdx));

    if (withTimer) {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(targetIdx + 1), 15000);
    }
  }

  /* ── 버튼 / 도트 이벤트 ── */
  leftBtn.addEventListener('click',  (e) => { e.stopPropagation(); goTo(targetIdx - 1); });
  rightBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(targetIdx + 1); });
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.dot)));

  /* ── 카드 클릭 / 호버 ── */
  cards.forEach((card, i) => {
    card.addEventListener('click', () => {
      if (!isDragging) location.href = `detail.html?id=${card.dataset.id}`;
    });
    card.addEventListener('mouseenter', () => { hoveredIdx = i; card.classList.add('is-hovered'); });
    card.addEventListener('mouseleave', () => { hoveredIdx = -1; card.classList.remove('is-hovered'); });
  });

  /* ── 드래그 (좌우 넘기기) ── */
  scene.addEventListener('pointerdown', (e) => {
    isDragging     = false;
    dragStartX     = e.clientX;
    dragAngleStart = norm(currentAngle);   // 정규화 값 기준
    scene.setPointerCapture(e.pointerId);
    scene.classList.add('dragging');
    clearInterval(autoTimer);
  });

  scene.addEventListener('pointermove', (e) => {
    if (e.buttons === 0) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 8) isDragging = true;
    if (isDragging) {
      currentAngle = targetAngle = dragAngleStart + dx / (radius * 0.7);
    }
  });

  scene.addEventListener('pointerup', () => {
    scene.classList.remove('dragging');
    if (isDragging) {
      // currentAngle 기준으로 가장 가까운 카드 스냅
      const rawIdx  = -norm(currentAngle) / angleStep;
      const snapIdx = Math.round(rawIdx);
      goTo(((snapIdx % n) + n) % n);
    }
    setTimeout(() => { isDragging = false; }, 50);
  });

  /* ── rAF 애니메이션 루프 ── */
  function tick() {
    const delta = targetAngle - currentAngle;

    if (Math.abs(delta) < 0.003) {
      // 목표에 충분히 가까우면 정확하게 스냅
      currentAngle = targetAngle = norm(targetAngle);
    } else {
      currentAngle += delta * 0.13;
    }

    cards.forEach((card, i) => {
      const a    = currentAngle + i * angleStep;
      const sinA = Math.sin(a);
      const cosA = Math.cos(a);

      const x   = sinA * radius;
      let   scl = 0.5  + 0.5  * ((cosA + 1) / 2);
      const opa = 0.22 + 0.78 * ((cosA + 1) / 2);
      const zi  = Math.round((cosA + 1) * 50);

      if (i === hoveredIdx) scl = Math.min(scl + 0.2, 1.2);

      card.style.transform = `translateX(${x.toFixed(1)}px) scale(${scl.toFixed(3)})`;
      card.style.opacity   = opa.toFixed(3);
      card.style.zIndex    = zi;
    });

    requestAnimationFrame(tick);
  }

  tick();
  goTo(0);
}

async function fetchContents() {
  const grid = document.getElementById('content-grid');
  grid.innerHTML = '<div class="loading"><div class="spinner"></div><p>콘텐츠 불러오는 중...</p></div>';

  const { data, error } = await db
    .from('ott_contents')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    grid.innerHTML = '<div class="empty-state"><div class="icon">⚠️</div><p>데이터를 불러오는 데 실패했습니다.</p></div>';
    return;
  }

  allContents = data || [];
  renderContents();
}

function renderContents() {
  const grid = document.getElementById('content-grid');
  const badge = document.getElementById('count-badge');

  let filtered = allContents;

  if (activeType !== '전체') {
    filtered = filtered.filter(c => c.content_type === activeType);
  }

  if (activeGenre !== '전체') {
    filtered = filtered.filter(c => c.genre === activeGenre);
  }

  badge.textContent = `(${filtered.length}개)`;

  if (filtered.length === 0) {
    grid.innerHTML = `
      <div class="empty-state">
        <div class="icon">🎬</div>
        <p>등록된 콘텐츠가 없습니다.</p>
        <a href="register.html" class="btn btn-primary">첫 번째 콘텐츠 등록하기</a>
      </div>`;
    return;
  }

  grid.innerHTML = filtered.map(c => createCardHTML(c)).join('');
}

function createCardHTML(c) {
  const stars = c.rating > 0 ? `<span class="card-rating">⭐ ${Number(c.rating).toFixed(1)}</span>` : '';
  const thumb = c.thumbnail_url
    ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}" onerror="this.parentElement.innerHTML='<div class=\\'card-thumb-fallback\\'><div class=\\'icon\\'>🎬</div><span>${esc(c.content_type)}</span></div>'">`
    : `<div class="card-thumb-fallback"><div class="icon">🎬</div><span>${esc(c.content_type)}</span></div>`;

  return `
    <div class="content-card" onclick="location.href='detail.html?id=${c.id}'">
      <div class="card-thumb">
        ${thumb}
        <span class="type-badge">${esc(c.content_type)}</span>
      </div>
      <div class="card-body">
        <div class="card-title" title="${esc(c.title)}">${esc(c.title)}</div>
        <div class="card-meta">
          <span>${esc(c.genre)}${c.release_year ? ' · ' + c.release_year : ''}</span>
          ${stars}
        </div>
      </div>
    </div>`;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

document.querySelectorAll('[data-type]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-type]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeType = btn.dataset.type;
    renderContents();
  });
});

document.querySelectorAll('[data-genre]').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('[data-genre]').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    activeGenre = btn.dataset.genre;
    renderContents();
  });
});

// 두 데이터 병렬 로딩
fetchDramas();
fetchContents();
