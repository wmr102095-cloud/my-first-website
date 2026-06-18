let allContents = [];
let activeType  = '전체';
const carouselCtrls = {}; // sceneId → AbortController

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

const CATEGORIES = [
  { type: '드라마',     group: 'group-drama', sceneId: 'scene-drama', rowId: 'row-drama', recId: 'rec-drama',
    top10: '지금 TOP10 드라마',    rec: '이런 드라마는 어떠세요?' },
  { type: '영화',       group: 'group-movie', sceneId: 'scene-movie', rowId: 'row-movie', recId: 'rec-movie',
    top10: '지금 TOP10 영화',      rec: '이런 영화는 어떠세요?' },
  { type: '애니메이션', group: 'group-anime', sceneId: 'scene-anime', rowId: 'row-anime', recId: 'rec-anime',
    top10: '지금 TOP10 애니메이션', rec: '이런 애니는 어떠세요?' },
];

/* ── 전체 데이터 로딩 ── */
async function fetchAllContent() {
  const { data } = await db
    .from('ott_contents')
    .select('*')
    .order('rating', { ascending: false });

  allContents = data || [];

  CATEGORIES.forEach(cat => {
    const items = allContents.filter(c => c.content_type === cat.type);

    renderDramaCarousel(items, cat.sceneId);

    const recSection = document.getElementById(cat.recId);
    const recommend  = [...items]
      .sort((a, b) => (b.release_year || 0) - (a.release_year || 0))
      .slice(0, 10);

    if (recommend.length && recSection) {
      recSection.style.display = '';
      renderContentRow(recommend, cat.rowId, { perPage: 5 });
    }
  });
}

/* ── 3D 캐러셀 렌더러 ── */
function renderDramaCarousel(dramas, sceneId) {
  const scene = document.getElementById(sceneId);
  if (!scene) return;
  const wrap    = scene.closest('.drama-carousel-3d-wrap');
  const section = scene.closest('.drama-section');

  if (carouselCtrls[sceneId]) carouselCtrls[sceneId].abort();
  const ctrl = new AbortController();
  carouselCtrls[sceneId] = ctrl;
  const { signal } = ctrl;

  wrap.querySelectorAll('.drama-nav').forEach(el => el.remove());
  section.querySelectorAll('.drama-dots').forEach(el => el.remove());

  if (!dramas.length) { section.style.display = 'none'; return; }
  section.style.display = '';

  const n         = dramas.length;
  const TAU       = 2 * Math.PI;
  const angleStep = TAU / n;
  const radius    = Math.max(360, Math.round((n * 260) / TAU));

  scene.innerHTML = dramas.map((c, i) => {
    const rank     = i + 1;
    const grad     = GRADIENTS[i % GRADIENTS.length];
    const thumb    = c.thumbnail_url
      ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}"
             onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallback = `<div class="drama-3d-card-fallback"
        style="background:${grad};${c.thumbnail_url ? 'display:none' : ''}">
        ${esc(c.title.charAt(0))}</div>`;
    const genreYear = [c.genre, c.release_year].filter(Boolean).join(' · ');
    const ratingVal = c.rating > 0 ? Number(c.rating).toFixed(1) : '';
    const descShort = c.description ? c.description.slice(0, 55) + (c.description.length > 55 ? '…' : '') : '';

    return `
      <div class="drama-3d-card" data-id="${c.id}" data-idx="${i}" data-rank="${rank}">
        <span class="drama-rank-badge">${rank}위</span>
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

  const leftBtn  = Object.assign(document.createElement('button'), { className: 'drama-nav drama-nav-left',  innerHTML: '&#8249;', type: 'button' });
  const rightBtn = Object.assign(document.createElement('button'), { className: 'drama-nav drama-nav-right', innerHTML: '&#8250;', type: 'button' });
  wrap.append(leftBtn, rightBtn);

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'drama-dots';
  dotsWrap.innerHTML = dramas.map((_, i) =>
    `<button class="drama-dot${i === 0 ? ' active' : ''}" data-dot="${i}" type="button"></button>`
  ).join('');
  section.appendChild(dotsWrap);

  const cards = Array.from(scene.querySelectorAll('.drama-3d-card'));
  const dots  = Array.from(dotsWrap.querySelectorAll('.drama-dot'));
  let targetIdx    = 0;
  let currentAngle = 0;
  let targetAngle  = 0;
  let hoveredIdx   = -1;
  let isDragging   = false;
  let dragStartX   = 0;
  let dragAngleStart = 0;
  let autoTimer;

  function goTo(idx, withTimer = true) {
    targetIdx = ((idx % n) + n) % n;
    const exactAngle = -targetIdx * angleStep;
    const offset = Math.round((currentAngle - exactAngle) / TAU);
    targetAngle  = exactAngle + offset * TAU;
    dots.forEach((d, i) => d.classList.toggle('active', i === targetIdx));
    if (withTimer) {
      clearInterval(autoTimer);
      autoTimer = setInterval(() => goTo(targetIdx + 1), 15000);
    }
  }

  leftBtn.addEventListener('click',  (e) => { e.stopPropagation(); goTo(targetIdx - 1); });
  rightBtn.addEventListener('click', (e) => { e.stopPropagation(); goTo(targetIdx + 1); });
  dots.forEach(d => d.addEventListener('click', () => goTo(+d.dataset.dot)));

  cards.forEach((card, i) => {
    card.addEventListener('click', () => { if (!isDragging) location.href = `detail.html?id=${dramas[i].id}`; });
    card.addEventListener('mouseenter', () => { hoveredIdx = i; card.classList.add('is-hovered'); });
    card.addEventListener('mouseleave', () => { hoveredIdx = -1; card.classList.remove('is-hovered'); });
  });

  let pointerDown = false;
  scene.addEventListener('pointerdown', (e) => {
    pointerDown = true; isDragging = false;
    dragStartX = e.clientX; dragAngleStart = currentAngle;
    scene.classList.add('dragging'); clearInterval(autoTimer);
    e.preventDefault();
  });
  window.addEventListener('pointermove', (e) => {
    if (!pointerDown) return;
    const dx = e.clientX - dragStartX;
    if (Math.abs(dx) > 8) isDragging = true;
    if (isDragging) currentAngle = targetAngle = dragAngleStart + dx / (radius * 0.7);
  }, { signal });
  window.addEventListener('pointerup', () => {
    if (!pointerDown) return;
    pointerDown = false; scene.classList.remove('dragging');
    if (isDragging) goTo(((Math.round(-currentAngle / angleStep) % n) + n) % n);
    setTimeout(() => { isDragging = false; }, 0);
  }, { signal });

  function tick() {
    if (signal.aborted) return;
    const delta = targetAngle - currentAngle;
    currentAngle += Math.abs(delta) < 0.002 ? (targetAngle - currentAngle) : delta * 0.14;

    cards.forEach((card, i) => {
      const a = currentAngle + i * angleStep;
      const sinA = Math.sin(a), cosA = Math.cos(a);
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

/* ── 가로 스크롤 카드 행 렌더러 ── */
function renderContentRow(items, wrapId, { perPage = 5 } = {}) {
  const wrap = document.getElementById(wrapId);
  if (!wrap) return;
  wrap.innerHTML = '';

  if (!items.length) return;

  const viewport = document.createElement('div');
  viewport.className = 'row-viewport';

  const track = document.createElement('div');
  track.className = 'row-track';

  items.forEach(c => {
    const stars = c.rating > 0 ? `<span class="card-rating">⭐ ${Number(c.rating).toFixed(1)}</span>` : '';
    const thumb = c.thumbnail_url
      ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=\\'card-thumb-fallback\\'><div class=\\'icon\\'>🎬</div></div>'">`
      : `<div class="card-thumb-fallback"><div class="icon">🎬</div></div>`;

    const card = document.createElement('div');
    card.className = 'content-card';
    card.onclick   = () => location.href = `detail.html?id=${c.id}`;
    card.innerHTML = `
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
      </div>`;
    track.appendChild(card);
  });

  viewport.appendChild(track);
  wrap.appendChild(viewport);

  const totalPages = Math.ceil(items.length / perPage);
  if (totalPages <= 1) return;

  let page = 0;

  const prevBtn = document.createElement('button');
  const nextBtn = document.createElement('button');
  prevBtn.type = nextBtn.type = 'button';
  prevBtn.className = 'row-nav-btn left hidden';
  nextBtn.className = 'row-nav-btn right';
  prevBtn.innerHTML = '&#8249;';
  nextBtn.innerHTML = '&#8250;';

  const dotsWrap = document.createElement('div');
  dotsWrap.className = 'row-dots';
  dotsWrap.innerHTML = Array.from({ length: totalPages }, (_, i) =>
    `<button class="row-dot${i === 0 ? ' active' : ''}" data-p="${i}" type="button"></button>`
  ).join('');

  function goTo(p) {
    page = Math.max(0, Math.min(p, totalPages - 1));
    const gap   = 14;
    const cardW = (viewport.clientWidth - (perPage - 1) * gap) / perPage;
    track.style.transform = `translateX(-${page * perPage * (cardW + gap)}px)`;
    prevBtn.classList.toggle('hidden', page === 0);
    nextBtn.classList.toggle('hidden', page === totalPages - 1);
    dotsWrap.querySelectorAll('.row-dot').forEach((d, i) => d.classList.toggle('active', i === page));
  }

  prevBtn.addEventListener('click', () => goTo(page - 1));
  nextBtn.addEventListener('click', () => goTo(page + 1));
  dotsWrap.querySelectorAll('.row-dot').forEach(d =>
    d.addEventListener('click', () => goTo(+d.dataset.p))
  );

  wrap.append(prevBtn, nextBtn, dotsWrap);
}

/* ── 네비 탭 전환 ── */
function refreshGroups(type) {
  const typeToGroup = { '드라마': 'group-drama', '영화': 'group-movie', '애니메이션': 'group-anime' };

  CATEGORIES.forEach(cat => {
    const el = document.getElementById(cat.group);
    if (!el) return;
    const show = type === '전체' || type === cat.type;
    el.style.display = type === '찜' ? 'none' : (show ? '' : 'none');
  });

  /* 찜 탭 안내 */
  let wishEl = document.getElementById('wishlist-empty');
  if (type === '찜') {
    if (!wishEl) {
      wishEl = document.createElement('div');
      wishEl.id = 'wishlist-empty';
      wishEl.className = 'empty-state';
      wishEl.innerHTML = '<div class="icon">🔖</div><p>찜한 콘텐츠가 없습니다.</p><p style="font-size:0.82rem;margin-top:6px;color:#666;">로그인 후 콘텐츠를 찜해보세요!</p>';
      document.querySelector('.main').appendChild(wishEl);
    }
    wishEl.style.display = '';
  } else if (wishEl) {
    wishEl.style.display = 'none';
  }
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

/* ── 네비게이션 이벤트 ── */
document.querySelectorAll('.nav-link[data-filter]').forEach(link => {
  link.addEventListener('click', (e) => {
    e.preventDefault();
    const filter = link.dataset.filter;
    document.querySelectorAll('.nav-link[data-filter]').forEach(l => l.classList.remove('active'));
    link.classList.add('active');
    activeType = filter;
    refreshGroups(filter);
  });
});

fetchAllContent();

/* ── 로그인 상태에 따라 헤더 업데이트 ── */
(async function updateHeader() {
  const { data: { session } } = await db.auth.getSession();
  const actions = document.getElementById('header-actions');
  if (!actions) return;

  if (session) {
    const { data: profile } = await db
      .from('profiles')
      .select('username')
      .eq('user_id', session.user.id)
      .single();

    const username = profile?.username || session.user.email;
    actions.innerHTML = `
      <span class="header-username">👤 ${esc(username)}</span>
      <button class="btn btn-ghost" id="logout-btn">로그아웃</button>`;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await db.auth.signOut();
      location.reload();
    });
  }
})();
