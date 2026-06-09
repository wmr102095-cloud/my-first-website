import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Divider,
} from '@mui/material'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import LoginIcon from '@mui/icons-material/Login'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { supabase } from '../supabaseClient'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('이메일과 비밀번호를 입력해주세요.')
      return
    }
    setLoading(true)
    setError('')

    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      setError('이메일 또는 비밀번호가 올바르지 않습니다.')
      setLoading(false)
    } else {
      navigate('/')
    }
  }

  return (
    <Box sx={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'radial-gradient(ellipse at center, #1a1a1a 0%, #080808 70%)',
      p: 2,
    }}>
      <Paper elevation={0} sx={{
        width: '100%',
        maxWidth: 420,
        p: 4,
        border: '1px solid rgba(232,232,232,0.15)',
        boxShadow: '0 0 40px rgba(232,232,232,0.05)',
        borderRadius: 3,
      }}>
        {/* 로고 */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <DirectionsCarIcon sx={{
            fontSize: 52,
            color: 'primary.main',
            filter: 'drop-shadow(0 0 10px rgba(232,232,232,0.5))',
            mb: 1,
          }} />
          <Typography variant="h5" fontWeight={800} sx={{
            color: 'primary.main',
            textShadow: '0 0 10px rgba(232,232,232,0.3)',
            letterSpacing: 6,
          }}>
            BENZ
          </Typography>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            벤츠 공식 커뮤니티
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="이메일"
            type="email"
            value={email}
            onChange={(e) => { setEmail(e.target.value); setError('') }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <EmailIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <TextField
            label="비밀번호"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            fullWidth
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <LockIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton onClick={() => setShowPw(!showPw)} edge="end" size="small">
                    {showPw ? <VisibilityOffIcon fontSize="small" /> : <VisibilityIcon fontSize="small" />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<LoginIcon />}
            onClick={handleLogin}
            disabled={loading}
            sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}
          >
            {loading ? '로그인 중...' : '로그인'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" textAlign="center">
          계정이 없으신가요?{' '}
          <Typography
            component={Link}
            to="/register"
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            회원가입
          </Typography>
        </Typography>
      </Paper>
    </Box>
  )
}
