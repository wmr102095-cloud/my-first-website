import { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [form, setForm] = useState({ username: '', password: '', confirm: '', name: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const handleRegister = async () => {
    const { username, password, confirm, name } = form

    if (!username.trim() || !password || !confirm || !name.trim()) {
      setError('모든 항목을 입력해주세요.'); return
    }
    if (username.trim().length < 3) {
      setError('아이디는 3자 이상이어야 합니다.'); return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.'); return
    }
    if (password !== confirm) {
      setError('비밀번호가 일치하지 않습니다.'); return
    }

    setLoading(true)
    setError('')

    const id = username.trim().toLowerCase()
    const fakeEmail = `${id}@minisns.app`

    // 아이디 중복 확인
    const { data: existing } = await supabase
      .from('sns_users')
      .select('id')
      .eq('username', id)
      .maybeSingle()

    if (existing) {
      setError('이미 사용 중인 아이디입니다.'); setLoading(false); return
    }

    // Supabase Auth 회원가입 (가상 이메일 사용)
    // → DB 트리거가 sns_users 프로필 자동 생성
    const { error: signUpErr } = await supabase.auth.signUp({
      email: fakeEmail,
      password,
      options: {
        data: {
          username: id,
          display_name: name.trim(),
        },
      },
    })

    if (signUpErr) {
      if (signUpErr.message.toLowerCase().includes('already')) {
        setError('이미 사용 중인 아이디입니다.')
      } else {
        setError(signUpErr.message)
      }
      setLoading(false)
      return
    }

    setTimeout(() => navigate('/'), 500)
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #dbdbdb', borderRadius: 2, p: 4, mb: 2 }}>
          <Typography sx={{ fontSize: '2.8rem', color: '#262626', mb: 0.5, fontWeight: 800, letterSpacing: '0.06em', textAlign: 'center' }}>
            MiniSNS
          </Typography>
          <Typography color="text.secondary" fontSize="0.9rem" fontWeight={600} textAlign="center" mb={3}>
            친구들의 일상을 함께 공유해보세요.
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>
          )}

          <TextField
            fullWidth
            placeholder="아이디 (3자 이상, 영문·숫자)"
            size="small"
            value={form.username}
            onChange={set('username')}
            sx={{ mb: 1.5 }}
            inputProps={{ maxLength: 20 }}
          />
          <TextField
            fullWidth
            placeholder="이름"
            size="small"
            value={form.name}
            onChange={set('name')}
            sx={{ mb: 1.5 }}
            inputProps={{ maxLength: 30 }}
          />
          <TextField
            fullWidth
            placeholder="비밀번호 (6자 이상)"
            type="password"
            size="small"
            value={form.password}
            onChange={set('password')}
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth
            placeholder="비밀번호 확인"
            type="password"
            size="small"
            value={form.confirm}
            onChange={set('confirm')}
            onKeyDown={e => e.key === 'Enter' && handleRegister()}
            sx={{ mb: 2.5 }}
          />

          <Button
            fullWidth
            variant="contained"
            onClick={handleRegister}
            disabled={loading}
            sx={{ height: 40, borderRadius: 2, bgcolor: '#0095f6', '&:hover': { bgcolor: '#1877f2' }, boxShadow: 'none', fontSize: '0.9rem' }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '가입하기'}
          </Button>

          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2} lineHeight={1.6}>
            가입하면 MiniSNS의 약관에 동의하게 됩니다.
          </Typography>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #dbdbdb', borderRadius: 2, p: 3, textAlign: 'center' }}>
          <Typography variant="body2" fontSize="0.9rem">
            계정이 있으신가요?{' '}
            <Typography
              component="span"
              onClick={() => navigate('/login')}
              sx={{ color: '#0095f6', fontWeight: 700, cursor: 'pointer' }}
            >
              로그인
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
