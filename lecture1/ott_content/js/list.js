let allContents = [];
let activeType = '전체';
let activeGenre = '전체';

// 드라마 원형 캐러셀용 그라디언트 팔레트
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
  const inner = document.getElementById('drama-track-inner');
  if (!dramas.length) {
    inner.parentElement.parentElement.style.display = 'none';
    return;
  }

  // 무한 루프를 위해 아이템 2배 복제
  const doubled = [...dramas, ...dramas];

  inner.innerHTML = doubled.map((c, i) => {
    const grad = GRADIENTS[i % GRADIENTS.length];
    const initial = c.title.charAt(0);
    const thumb = c.thumbnail_url
      ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}"
           onerror="this.style.display='none';this.nextElementSibling.style.display='flex'">`
      : '';
    const fallback = `<div class="drama-circle-fallback" style="background:${grad};${c.thumbnail_url ? 'display:none' : ''}">${initial}</div>`;
    const rating = c.rating > 0 ? `<span class="drama-rating-dot">⭐ ${Number(c.rating).toFixed(1)}</span>` : '';

    return `
      <div class="drama-circle-card" onclick="location.href='detail.html?id=${c.id}'" title="${esc(c.title)}">
        <div class="drama-circle" style="background:${grad}">
          ${thumb}
          ${fallback}
        </div>
        <span class="drama-circle-label">${esc(c.title)}</span>
        ${rating}
      </div>`;
  }).join('');

  // 아이템 수에 따라 애니메이션 속도 조정
  const speed = Math.max(20, dramas.length * 3.5);
  inner.style.animationDuration = `${speed}s`;
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
