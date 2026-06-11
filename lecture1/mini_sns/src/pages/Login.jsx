import { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, CircularProgress, Divider } from '@mui/material'
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
            게임 런처에 로그인
          </Typography>
        </Box>

        {/* Form */}
        <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, p: 3.5 }}>
          {error && <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', '& .MuiAlert-icon': { color: '#e74c3c' } }}>{error}</Alert>}

          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5, fontWeight: 600 }}>아이디</Typography>
          <TextField
            fullWidth
            placeholder="아이디 입력"
            size="small"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            sx={{ mb: 2 }}
            inputProps={{ maxLength: 20 }}
          />

          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 0.5, fontWeight: 600 }}>비밀번호</Typography>
          <TextField
            fullWidth
            placeholder="비밀번호 입력"
            type="password"
            size="small"
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
            sx={{ mb: 2.5 }}
          />

          <Button
            fullWidth
            variant="contained"
            color="primary"
            onClick={handleLogin}
            disabled={loading}
            sx={{ height: 42, fontSize: '0.95rem' }}
          >
            {loading ? <CircularProgress size={20} sx={{ color: '#c6d4df' }} /> : '로그인'}
          </Button>
        </Box>

        <Divider sx={{ my: 2, borderColor: '#2a475e' }} />

        <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, p: 2.5, textAlign: 'center' }}>
          <Typography sx={{ fontSize: '0.88rem', color: '#8fa4b9' }}>
            계정이 없으신가요?{' '}
            <Typography
              component="span"
              onClick={() => navigate('/register')}
              sx={{ color: '#66c0f4', fontWeight: 700, cursor: 'pointer', '&:hover': { textDecoration: 'underline' } }}
            >
              무료 계정 만들기
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
