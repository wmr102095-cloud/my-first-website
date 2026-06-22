let allContents = [];
let activeType  = '전체';
const carouselCtrls = {};

/* ══════════════════════════════════
   팝업 & 찜하기
══════════════════════════════════ */
const _popupOverlay = document.getElementById('drama-popup-overlay');
const _popupClose   = document.getElementById('popup-close-btn');
const _wishBtn      = document.getElementById('popup-wish-btn');

/* 찜 목록 (localStorage) */
function _getWish()       { try { return JSON.parse(localStorage.getItem('boom_wish') || '[]'); } catch { return []; } }
function _saveWish(list)  { localStorage.setItem('boom_wish', JSON.stringify(list)); }
function _isWished(id)    { return _getWish().includes(String(id)); }
function _toggleWish(id) {
  const list = _getWish(), sid = String(id), idx = list.indexOf(sid);
  idx === -1 ? list.push(sid) : list.splice(idx, 1);
  _saveWish(list);
  return idx === -1;
}
function _refreshWishBtn(id) {
  const on = _isWished(id);
  _wishBtn.textContent = on ? '♥ 찜 완료' : '♡ 찜하기';
  _wishBtn.classList.toggle('wished', on);
}

/* 팝업 열기 */
function openPopup(c, rank) {
  const img  = document.getElementById('popup-poster-img');
  const fb   = document.getElementById('popup-poster-fb');

  if (c.thumbnail_url) {
    img.src = c.thumbnail_url; img.alt = c.title;
    img.style.display = 'block'; fb.style.display = 'none';
    img.onerror = () => { img.style.display = 'none'; fb.style.display = 'flex'; fb.textContent = c.title.charAt(0); };
  } else {
    img.style.display = 'none'; fb.style.display = 'flex'; fb.textContent = c.title.charAt(0);
  }

  const badge = document.getElementById('popup-rank-badge');
  badge.textContent = rank ? `${rank}위` : '';
  badge.style.display = rank ? '' : 'none';

  document.getElementById('popup-type').textContent   = c.content_type || '';
  document.getElementById('popup-genre').textContent  = c.genre || '';
  document.getElementById('popup-year').textContent   = c.release_year || '';
  document.getElementById('popup-rating').textContent = c.rating > 0 ? `⭐ ${Number(c.rating).toFixed(1)}` : '';
  document.getElementById('popup-title').textContent   = c.title || '';
  document.getElementById('popup-desc').textContent    = c.description || '';
  document.getElementById('popup-director').textContent = c.director || '–';
  document.getElementById('popup-cast').textContent    = c.actors || '–';

  document.getElementById('popup-watch-btn').href = `detail.html?id=${c.id}`;
  _wishBtn.dataset.id = c.id;
  _refreshWishBtn(c.id);

  _popupOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function closePopup() {
  _popupOverlay.classList.remove('open');
  document.body.style.overflow = '';
}

_popupClose.addEventListener('click', closePopup);
_popupOverlay.addEventListener('click', e => { if (e.target === _popupOverlay) closePopup(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') closePopup(); });
_wishBtn.addEventListener('click', function () {
  _toggleWish(this.dataset.id);
  _refreshWishBtn(this.dataset.id);
});

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

    // TOP 10만 캐러셀에 표시 (rating 내림차순으로 이미 정렬됨)
    renderDramaCarousel(items.slice(0, 10), cat.sceneId);

    const recSection = document.getElementById(cat.recId);
    const recommend  = [...items]
      .sort((a, b) => (b.release_year || 0) - (a.release_year || 0))
      .slice(0, 10);

    if (recommend.length && recSection) {
      recSection.style.display = '';
      renderContentRow(recommend, cat.rowId, { perPage: 5 });
    }

    // 전체 작품 섹션
    renderAllSection(items, cat.group, cat.type);
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
    card.addEventListener('click', () => { if (!isDragging) openPopup(dramas[i], i + 1); });
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

/* ── 전체 작품 그리드 섹션 ── */
function renderAllSection(items, groupId, typeName) {
  const group = document.getElementById(groupId);
  if (!group || !items.length) return;

  // 기존 전체 섹션 제거 후 재생성
  group.querySelector('.all-section')?.remove();

  const section = document.createElement('div');
  section.className = 'drama-section all-section';

  const titleDiv = document.createElement('div');
  titleDiv.className = 'section-title';
  titleDiv.innerHTML = `<span>${typeName} 전체</span><span class="count-badge">${items.length}작품</span>`;

  const grid = document.createElement('div');
  grid.className = 'content-grid';

  items.forEach(c => {
    const stars = c.rating > 0 ? `<span class="card-rating">⭐ ${Number(c.rating).toFixed(1)}</span>` : '';
    const thumb = c.thumbnail_url
      ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}" loading="lazy"
             onerror="this.parentElement.innerHTML='<div class=\\'card-thumb-fallback\\'><div class=\\'icon\\'>🎬</div></div>'">`
      : `<div class="card-thumb-fallback"><div class="icon">🎬</div></div>`;
    const card = document.createElement('div');
    card.className = 'content-card';
    card.onclick = () => openPopup(c, null);
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
    grid.appendChild(card);
  });

  section.append(titleDiv, grid);
  section.style.display = 'none'; // 기본 숨김 — 카테고리 탭 클릭 시 표시
  group.appendChild(section);
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
    card.onclick   = () => openPopup(c, null);
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

    // 전체 탭에서는 전체작품 섹션 숨김, 카테고리 탭에서만 표시
    const allSec = el.querySelector('.all-section');
    if (allSec) allSec.style.display = (type === cat.type) ? '' : 'none';
  });

  /* 찜 탭 */
  let wishSection = document.getElementById('wishlist-section');
  if (type === '찜') {
    if (!wishSection) {
      wishSection = document.createElement('div');
      wishSection.id = 'wishlist-section';
      document.querySelector('.main').appendChild(wishSection);
    }
    const ids = _getWish();
    const wished = allContents.filter(c => ids.includes(String(c.id)));
    if (wished.length) {
      wishSection.innerHTML = `<div class="section-title"><span>나의 찜 목록</span></div><div class="content-grid" id="wishlist-grid"></div>`;
      wished.forEach(c => {
        const stars = c.rating > 0 ? `<span class="card-rating">⭐ ${Number(c.rating).toFixed(1)}</span>` : '';
        const thumb = c.thumbnail_url
          ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-thumb-fallback\\'><div class=\\'icon\\'>🎬</div></div>'">`
          : `<div class="card-thumb-fallback"><div class="icon">🎬</div></div>`;
        const card = document.createElement('div');
        card.className = 'content-card';
        card.onclick = () => openPopup(c, null);
        card.innerHTML = `<div class="card-thumb">${thumb}<span class="type-badge">${esc(c.content_type)}</span></div><div class="card-body"><div class="card-title" title="${esc(c.title)}">${esc(c.title)}</div><div class="card-meta"><span>${esc(c.genre)}${c.release_year ? ' · ' + c.release_year : ''}</span>${stars}</div></div>`;
        document.getElementById('wishlist-grid').appendChild(card);
      });
    } else {
      wishSection.innerHTML = '<div class="empty-state"><div class="icon">🔖</div><p>찜한 콘텐츠가 없습니다.</p><p style="font-size:0.82rem;margin-top:6px;color:#666;">콘텐츠 팝업에서 ♡ 찜하기를 눌러보세요!</p></div>';
    }
    wishSection.style.display = '';
  } else if (wishSection) {
    wishSection.style.display = 'none';
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

/* ══════════════════════════════════
   검색
══════════════════════════════════ */
const _searchOverlay  = document.getElementById('search-overlay');
const _searchInput    = document.getElementById('search-input');
const _searchResults  = document.getElementById('search-results');
const _searchBtn      = document.getElementById('search-btn');
const _searchCloseBtn = document.getElementById('search-close-btn');

function openSearch() {
  _searchOverlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  setTimeout(() => _searchInput.focus(), 60);
}
function closeSearch() {
  _searchOverlay.classList.remove('open');
  document.body.style.overflow = '';
  _searchInput.value = '';
  _searchResults.innerHTML = '<p class="search-hint">검색어를 입력하세요</p>';
}

function renderSearch(q) {
  if (!q) { _searchResults.innerHTML = '<p class="search-hint">검색어를 입력하세요</p>'; return; }
  const lq   = q.toLowerCase();
  const hits = allContents.filter(c =>
    c.title?.toLowerCase().includes(lq) ||
    c.genre?.toLowerCase().includes(lq) ||
    c.director?.toLowerCase().includes(lq) ||
    c.actors?.toLowerCase().includes(lq)
  );
  if (!hits.length) { _searchResults.innerHTML = '<p class="search-hint">검색 결과가 없습니다</p>'; return; }

  _searchResults.innerHTML = `<div class="search-count">${hits.length}개 결과</div><div class="search-grid" id="s-grid"></div>`;
  const grid = document.getElementById('s-grid');
  hits.forEach(c => {
    const thumb = c.thumbnail_url
      ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}" loading="lazy" onerror="this.parentElement.innerHTML='<div class=\\'card-thumb-fallback\\'><div class=\\'icon\\'>🎬</div></div>'">`
      : `<div class="card-thumb-fallback"><div class="icon">🎬</div></div>`;
    const stars = c.rating > 0 ? `<span class="card-rating">⭐ ${Number(c.rating).toFixed(1)}</span>` : '';
    const card = document.createElement('div');
    card.className = 'content-card';
    card.onclick = () => { closeSearch(); openPopup(c, null); };
    card.innerHTML = `
      <div class="card-thumb">${thumb}<span class="type-badge">${esc(c.content_type)}</span></div>
      <div class="card-body">
        <div class="card-title" title="${esc(c.title)}">${esc(c.title)}</div>
        <div class="card-meta"><span>${esc(c.genre)}${c.release_year ? ' · ' + c.release_year : ''}</span>${stars}</div>
      </div>`;
    grid.appendChild(card);
  });
}

/* 이벤트 위임 — innerHTML 교체 후에도 동작 */
document.addEventListener('click', e => { if (e.target.closest('#search-btn')) openSearch(); });
_searchCloseBtn.addEventListener('click', closeSearch);
_searchOverlay.addEventListener('click', e => { if (e.target === _searchOverlay) closeSearch(); });
document.addEventListener('keydown', e => {
  if (e.key === 'Escape' && _searchOverlay.classList.contains('open')) closeSearch();
});
let _sDeb;
_searchInput.addEventListener('input', () => {
  clearTimeout(_sDeb);
  _sDeb = setTimeout(() => renderSearch(_searchInput.value.trim()), 160);
});

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
    const SEARCH_SVG = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>`;
    actions.innerHTML = `
      <button id="search-btn" class="search-icon-btn" aria-label="검색" type="button">${SEARCH_SVG}</button>
      <span class="header-username">👤 ${esc(username)}</span>
      <button class="btn btn-ghost" id="logout-btn">로그아웃</button>`;

    document.getElementById('logout-btn').addEventListener('click', async () => {
      await db.auth.signOut();
      location.reload();
    });
  }
})();
