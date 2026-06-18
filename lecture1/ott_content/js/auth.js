/* ── 탭 전환 ── */
document.querySelectorAll('.auth-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    const target = tab.dataset.tab;
    document.querySelectorAll('.auth-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
    tab.classList.add('active');
    document.getElementById(`${target}-form`).classList.add('active');
    clearMessages();
  });
});

/* ── 비밀번호 보기 토글 ── */
document.querySelectorAll('.pw-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const input = btn.previousElementSibling;
    input.type = input.type === 'password' ? 'text' : 'password';
    btn.textContent = input.type === 'password' ? '👁' : '🙈';
  });
});

function clearMessages() {
  ['login-error','signup-error','signup-ok'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.textContent = '';
  });
}

function setError(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function setOk(id, msg) {
  const el = document.getElementById(id);
  if (el) el.textContent = msg;
}

function setLoading(btn, loading) {
  btn.disabled = loading;
  btn.textContent = loading ? '처리 중...' : btn.dataset.label;
}

/* 버튼 원본 텍스트 저장 */
document.querySelectorAll('.auth-submit').forEach(btn => {
  btn.dataset.label = btn.textContent;
});

/* ── 로그인 ── */
document.getElementById('login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const identifier = document.getElementById('login-id').value.trim();
  const password   = document.getElementById('login-pw').value;
  const btn        = e.target.querySelector('.auth-submit');

  if (!identifier || !password) {
    setError('login-error', '아이디(이메일)와 비밀번호를 입력해주세요.');
    return;
  }

  setLoading(btn, true);

  try {
    let email = identifier;

    /* 이메일이 아닌 경우 → username으로 email 조회 */
    if (!identifier.includes('@')) {
      const { data: profile, error: pErr } = await db
        .from('profiles')
        .select('login_email')
        .eq('username', identifier)
        .single();

      if (pErr || !profile) {
        setError('login-error', '존재하지 않는 아이디입니다.');
        return;
      }
      email = profile.login_email;
    }

    const { error } = await db.auth.signInWithPassword({ email, password });

    if (error) {
      if (error.message.includes('Invalid login')) {
        setError('login-error', '비밀번호가 올바르지 않습니다.');
      } else {
        setError('login-error', error.message);
      }
      return;
    }

    /* 로그인 성공 → 메인으로 */
    window.location.href = 'index.html';

  } catch (err) {
    setError('login-error', '오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    setLoading(btn, false);
  }
});

/* ── 회원가입 ── */
document.getElementById('signup-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  clearMessages();

  const username = document.getElementById('su-username').value.trim();
  const email    = document.getElementById('su-email').value.trim();
  const pw       = document.getElementById('su-pw').value;
  const pw2      = document.getElementById('su-pw2').value;
  const btn      = e.target.querySelector('.auth-submit');

  /* 유효성 검사 */
  if (!username) {
    setError('signup-error', '아이디를 입력해주세요.');
    return;
  }
  if (!/^[a-zA-Z0-9_]{3,20}$/.test(username)) {
    setError('signup-error', '아이디는 영문·숫자·_만 사용, 3~20자로 입력해주세요.');
    return;
  }
  if (pw.length < 6) {
    setError('signup-error', '비밀번호는 6자 이상이어야 합니다.');
    return;
  }
  if (pw !== pw2) {
    setError('signup-error', '비밀번호가 일치하지 않습니다.');
    return;
  }

  setLoading(btn, true);

  try {
    /* 아이디 중복 확인 */
    const { data: existing } = await db
      .from('profiles')
      .select('id')
      .eq('username', username)
      .maybeSingle();

    if (existing) {
      setError('signup-error', '이미 사용 중인 아이디입니다.');
      return;
    }

    /* 이메일 없으면 가상 이메일 생성 */
    const authEmail = email || `${username.toLowerCase()}@boom-ott.app`;

    const { error } = await db.auth.signUp({
      email: authEmail,
      password: pw,
      options: {
        data: { username },
      },
    });

    if (error) {
      if (error.message.includes('already registered')) {
        setError('signup-error', '이미 사용 중인 이메일입니다.');
      } else {
        setError('signup-error', error.message);
      }
      return;
    }

    /* 이메일 인증 불필요 시 바로 로그인, 필요 시 안내 */
    setOk('signup-ok', email
      ? `가입 완료! ${email}로 인증 메일이 발송됐습니다.`
      : '가입 완료! 자동으로 로그인됩니다...'
    );

    if (!email) {
      setTimeout(() => { window.location.href = 'index.html'; }, 1200);
    }

  } catch (err) {
    setError('signup-error', '오류가 발생했습니다. 다시 시도해주세요.');
  } finally {
    setLoading(btn, false);
  }
});

/* ── 이미 로그인된 경우 메인으로 ── */
db.auth.getSession().then(({ data: { session } }) => {
  if (session) window.location.href = 'index.html';
});
