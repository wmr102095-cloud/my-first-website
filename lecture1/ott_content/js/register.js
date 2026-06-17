const thumbInput = document.getElementById('thumbnail_url');
const thumbPreview = document.getElementById('thumb-preview');
const thumbImg = document.getElementById('thumb-img');

thumbInput.addEventListener('input', () => {
  const url = thumbInput.value.trim();
  if (url) {
    thumbImg.src = url;
    thumbPreview.style.display = 'block';
    thumbImg.onerror = () => { thumbPreview.style.display = 'none'; };
  } else {
    thumbPreview.style.display = 'none';
  }
});

document.getElementById('register-form').addEventListener('submit', async (e) => {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = '등록 중...';

  const title = document.getElementById('title').value.trim();
  const content_type = document.getElementById('content_type').value;
  const genre = document.getElementById('genre').value;
  const thumbnail_url = document.getElementById('thumbnail_url').value.trim() || null;
  const director = document.getElementById('director').value.trim() || null;
  const actors = document.getElementById('actors').value.trim() || null;
  const release_year = document.getElementById('release_year').value
    ? parseInt(document.getElementById('release_year').value) : null;
  const rating = document.getElementById('rating').value
    ? parseFloat(document.getElementById('rating').value) : 0.0;
  const description = document.getElementById('description').value.trim() || null;

  const { error } = await db.from('ott_contents').insert([{
    title, content_type, genre, thumbnail_url,
    director, actors, release_year, rating, description
  }]);

  if (error) {
    showToast('등록에 실패했습니다: ' + error.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = '등록하기';
    return;
  }

  showToast('콘텐츠가 등록되었습니다! 🎉', 'success');
  setTimeout(() => { location.href = 'index.html'; }, 1200);
});

function showToast(msg, type = 'success') {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = msg;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}
