import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Divider,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import { supabase } from '../supabaseClient'

const BRANDS = [
  { key: 'benz', logo: `${import.meta.env.BASE_URL}logos/mercedes.webp` },
  { key: 'audi', logo: `${import.meta.env.BASE_URL}logos/audi.svg` },
  { key: 'bmw',  logo: `${import.meta.env.BASE_URL}logos/bmw.svg` },
]

// 아이디로 내부 이메일 생성 (Supabase Auth는 이메일 필수)
const toFakeEmail = (username) => `${username.trim().toLowerCase()}@benzcomm.com`

export default function Register() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!username.trim() || !password.trim()) {
      setError('아이디와 비밀번호를 입력해주세요.')
      return
    }
    if (username.trim().length < 2) {
      setError('아이디는 2자 이상이어야 합니다.')
      return
    }
    if (!/^[a-zA-Z0-9가-힣_]+$/.test(username.trim())) {
      setError('아이디는 영문, 숫자, 한글, 밑줄(_)만 사용 가능합니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email: toFakeEmail(username),
      password,
      options: { data: { username: username.trim() } },
    })

    if (error) {
      const msg = error.message
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('이미 사용 중인 아이디입니다.')
      } else if (msg.includes('Password') || msg.includes('password')) {
        setError('비밀번호는 6자 이상이어야 합니다.')
      } else if (msg.includes('rate limit') || msg.includes('too many')) {
        setError('요청이 너무 많습니다. 잠시 후 다시 시도해주세요.')
      } else {
        setError('회원가입에 실패했습니다. 다시 시도해주세요.')
      }
      setLoading(false)
      return
    }

    if (data.session) {
      navigate('/')
    } else {
      // 이메일 인증이 켜진 경우 (보통 OFF 상태)
      navigate('/login')
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
          <Box
            onClick={() => navigate('/')}
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 2.5, mb: 1.5, cursor: 'pointer' }}
          >
            {BRANDS.map(b => (
              <img key={b.key} src={b.logo} alt={b.key}
                style={{ width: 36, height: 36, objectFit: 'contain', filter: 'brightness(0) invert(1)', opacity: 0.9 }} />
            ))}
          </Box>
          <Typography variant="body2" color="text.secondary" mt={0.5}>
            회원가입
          </Typography>
        </Box>

        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <TextField
            label="아이디"
            value={username}
            onChange={(e) => { setUsername(e.target.value); setError('') }}
            fullWidth
            placeholder="2자 이상 (영문, 숫자, 한글)"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
          />

          <TextField
            label="비밀번호"
            type={showPw ? 'text' : 'password'}
            value={password}
            onChange={(e) => { setPassword(e.target.value); setError('') }}
            fullWidth
            placeholder="6자 이상"
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
            onKeyDown={(e) => e.key === 'Enter' && handleRegister()}
          />

          <Button
            variant="contained"
            size="large"
            fullWidth
            startIcon={<HowToRegIcon />}
            onClick={handleRegister}
            disabled={loading}
            sx={{ mt: 1, py: 1.5, fontWeight: 700, fontSize: 16, letterSpacing: 1 }}
          >
            {loading ? '가입 중...' : '회원가입'}
          </Button>
        </Box>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body2" color="text.secondary" textAlign="center">
          이미 계정이 있으신가요?{' '}
          <Typography
            component={Link}
            to="/login"
            variant="body2"
            sx={{ color: 'primary.main', fontWeight: 700, textDecoration: 'none', '&:hover': { textDecoration: 'underline' } }}
          >
            로그인
          </Typography>
        </Typography>
      </Paper>
    </Box>
  )
}
