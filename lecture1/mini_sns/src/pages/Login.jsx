import { useState } from 'react'
import { Box, Typography, TextField, Button, Divider, Alert, CircularProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!username.trim() || !password) { setError('아이디와 비밀번호를 입력해주세요.'); return }
    setLoading(true)
    setError('')

    const fakeEmail = `${username.trim().toLowerCase()}@minisns.app`
    const { error: err } = await supabase.auth.signInWithPassword({ email: fakeEmail, password })

    if (err) setError('아이디 또는 비밀번호가 올바르지 않습니다.')
    else navigate('/')
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #dbdbdb', borderRadius: 2, p: 4, mb: 2, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '2.8rem', color: '#262626', mb: 3, fontWeight: 800, letterSpacing: '0.06em' }}>
            MiniSNS
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>
          )}

          <TextField
            fullWidth
            placeholder="아이디"
            size="small"
            value={username}
            onChange={e => { setUsername(e.target.value); setError('') }}
            sx={{ mb: 1.5 }}
          />
          <TextField
            fullWidth
            placeholder="비밀번호"
            type="password"
            size="small"
            value={password}
            onChange={e => { setPassword(e.target.value); setError('') }}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            sx={{ mb: 2 }}
          />
          <Button
            fullWidth
            variant="contained"
            onClick={handleLogin}
            disabled={loading}
            sx={{ height: 40, borderRadius: 2, fontSize: '0.9rem', bgcolor: '#0095f6', '&:hover': { bgcolor: '#1877f2' }, boxShadow: 'none' }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '로그인'}
          </Button>

          <Divider sx={{ my: 2.5, '&::before, &::after': { borderColor: '#dbdbdb' } }}>
            <Typography variant="caption" color="text.secondary" fontWeight={600}>또는</Typography>
          </Divider>

          <Button
            fullWidth
            variant="text"
            onClick={() => navigate('/register')}
            sx={{ color: '#0095f6', fontWeight: 700, fontSize: '0.9rem' }}
          >
            새 계정 만들기
          </Button>
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #dbdbdb', borderRadius: 2, p: 3, textAlign: 'center' }}>
          <Typography variant="body2" fontSize="0.9rem">
            계정이 없으신가요?{' '}
            <Typography
              component="span"
              onClick={() => navigate('/register')}
              sx={{ color: '#0095f6', fontWeight: 700, cursor: 'pointer' }}
            >
              가입하기
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
