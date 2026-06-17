const id = new URLSearchParams(location.search).get('id');
const container = document.getElementById('detail-container');

if (!id) {
  container.innerHTML = `
    <div class="empty-state">
      <div class="icon">🔍</div>
      <p>콘텐츠를 찾을 수 없습니다.</p>
      <a href="index.html" class="btn btn-primary">목록으로 돌아가기</a>
    </div>`;
} else {
  loadDetail();
}

async function loadDetail() {
  const { data, error } = await db
    .from('ott_contents')
    .select('*')
    .eq('id', id)
    .single();

  if (error || !data) {
    container.innerHTML = `
      <div class="empty-state">
        <div class="icon">⚠️</div>
        <p>콘텐츠를 불러오지 못했습니다.</p>
        <a href="index.html" class="btn btn-primary">목록으로 돌아가기</a>
      </div>`;
    return;
  }

  document.title = `${data.title} - OTT Contents`;
  renderDetail(data);
}

function renderDetail(c) {
  const thumb = c.thumbnail_url
    ? `<img src="${esc(c.thumbnail_url)}" alt="${esc(c.title)}" onerror="this.parentElement.innerHTML='<div class=\\'detail-poster-fallback\\'><div class=\\'icon\\'>🎬</div><span>${esc(c.content_type)}</span></div>'">`
    : `<div class="detail-poster-fallback"><div class="icon">🎬</div><span>${esc(c.content_type)}</span></div>`;

  const rating = c.rating > 0
    ? `<div class="detail-rating">⭐ ${Number(c.rating).toFixed(1)} <span>/ 10</span></div>`
    : '';

  const metaItems = [
    c.release_year ? `<div class="detail-meta-item"><span class="key">개봉연도</span><span class="val">${c.release_year}년</span></div>` : '',
    c.director ? `<div class="detail-meta-item"><span class="key">감독</span><span class="val">${esc(c.director)}</span></div>` : '',
    c.actors ? `<div class="detail-meta-item"><span class="key">출연진</span><span class="val">${esc(c.actors)}</span></div>` : '',
  ].filter(Boolean).join('');

  container.innerHTML = `
    <div class="detail-back">
      <a href="index.html" class="btn btn-ghost">← 목록으로</a>
    </div>

    <div class="detail-hero">
      <div class="detail-poster">${thumb}</div>
      <div class="detail-info">
        <span class="detail-type-badge">${esc(c.content_type)}</span>
        <h1 class="detail-title">${esc(c.title)}</h1>
        ${rating}
        <div class="detail-tags">
          <span class="detail-tag">${esc(c.genre)}</span>
          ${c.release_year ? `<span class="detail-tag">${c.release_year}</span>` : ''}
        </div>
        ${metaItems ? `<div class="detail-meta-list">${metaItems}</div>` : ''}
      </div>
    </div>

    ${c.description ? `
    <div class="detail-description">
      <h2>줄거리</h2>
      <p>${esc(c.description)}</p>
    </div>` : ''}`;
}

function esc(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
