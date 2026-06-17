let allContents = [];
let activeType = '전체';
let activeGenre = '전체';

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
    ? `<img src="${escapeHTML(c.thumbnail_url)}" alt="${escapeHTML(c.title)}" onerror="this.parentElement.innerHTML='<div class=\\'card-thumb-fallback\\'><div class=\\'icon\\'>🎬</div><span>${escapeHTML(c.content_type)}</span></div>'">`
    : `<div class="card-thumb-fallback"><div class="icon">🎬</div><span>${escapeHTML(c.content_type)}</span></div>`;

  return `
    <div class="content-card" onclick="location.href='detail.html?id=${c.id}'">
      <div class="card-thumb">
        ${thumb}
        <span class="type-badge">${escapeHTML(c.content_type)}</span>
      </div>
      <div class="card-body">
        <div class="card-title" title="${escapeHTML(c.title)}">${escapeHTML(c.title)}</div>
        <div class="card-meta">
          <span>${escapeHTML(c.genre)}${c.release_year ? ' · ' + c.release_year : ''}</span>
          ${stars}
        </div>
      </div>
    </div>`;
}

function escapeHTML(str) {
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

fetchContents();
