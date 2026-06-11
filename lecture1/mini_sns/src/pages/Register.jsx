import { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, CircularProgress, Divider } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => { setForm((f) => ({ ...f, [k]: e.target.value })); setError('') }

  const handleRegister = async () => {
    const { username, password, confirm, name } = form
    if (!username.trim() || !password || !confirm || !name.trim()) { setError('모든 항목을 입력해주세요.'); return }
    if (username.trim().length < 3) { setError('아이디는 3자 이상이어야 합니다.'); return }
    if (password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    if (password !== confirm) { setError('비밀번호가 일치하지 않습니다.'); return }

    setLoading(true)
    setError('')

    const id = username.trim().toLowerCase()
    const fakeEmail = `${id}@minisns.app`

    const { data: existing } = await supabase.from('sns_users').select('id').eq('username', id).maybeSingle()
    if (existing) { setError('이미 사용 중인 아이디입니다.'); setLoading(false); return }

    const { error: signUpErr } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: { data: { username: id, display_name: name.trim() } },
    })

    if (signUpErr) {
      setError(signUpErr.message.toLowerCase().includes('already') ? '이미 사용 중인 아이디입니다.' : signUpErr.message)
      setLoading(false)
      return
    }

    setTimeout(() => navigate('/'), 500)
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838', display: 'flex', alignItems: 'center', justifyContent: 'center', px: 2 }}>
      <Box sx={{ width: '100%', maxWidth: 380 }}>
        {/* Logo */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography sx={{
            fontSize: '3.5rem', fontWeight: 900, letterSpacing: '0.12em',
            background: 'linear-gradient(135deg, #66c0f4, #1a44c2)',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent',
          }}>
            StyX
          </Typography>
          <Typography sx={{ color: '#8fa4b9', fontSize: '0.88rem', mt: 0.5 }}>
            무료 계정을 만들고 게임을 즐겨보세요
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, p: 3.5 }}>
          {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', '& .MuiAlert-icon': { color: '#e74c3c' } }}>{error}</Alert>}

          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5, fontWeight: 600 }}>아이디</Typography>
          <TextField fullWidth placeholder="영문, 숫자 3자 이상" size="small" value={form.username} onChange={set('username')} sx={{ mb: 2 }} inputProps={{ maxLength: 20 }} />

          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5, fontWeight: 600 }}>이름</Typography>
          <TextField fullWidth placeholder="표시될 이름" size="small" value={form.name} onChange={set('name')} sx={{ mb: 2 }} inputProps={{ maxLength: 30 }} />

          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5, fontWeight: 600 }}>비밀번호</Typography>
          <TextField fullWidth placeholder="6자 이상" type="password" size="small" value={form.password} onChange={set('password')} sx={{ mb: 2 }} />

          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5, fontWeight: 600 }}>비밀번호 확인</Typography>
          <TextField
            fullWidth placeholder="비밀번호 재입력" type="password" size="small"
            value={form.confirm} onChange={set('confirm')}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
            sx={{ mb: 2.5 }}
          />

          <Button fullWidth variant="contained" color="primary" onClick={handleRegister} disabled={loading} sx={{ height: 42, fontSize: '0.95rem', mb: 1.5 }}>
            {loading ? <CircularProgress size={20} sx={{ color: '#c6d4df' }} /> : '계정 만들기'}
          </Button>

          <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9', textAlign: 'center', lineHeight: 1.6 }}>
            계정을 만들면 StyX의 서비스 약관에 동의하게 됩니다.
          </Typography>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#2a475e' }} />

        <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, p: 2.5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.88rem', color: '#8fa4b9' }}>
            이미 계정이 있으신가요?{' '}
            <Typography
              component="span"
              onClick={() => navigate('/login')}
              sx={{ color: '#66c0f4', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              로그인
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
