import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import {
  Box, Paper, Typography, TextField, Button, Alert,
  InputAdornment, IconButton, Divider,
} from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import EmailIcon from '@mui/icons-material/Email'
import LockIcon from '@mui/icons-material/Lock'
import VisibilityIcon from '@mui/icons-material/Visibility'
import VisibilityOffIcon from '@mui/icons-material/VisibilityOff'
import HowToRegIcon from '@mui/icons-material/HowToReg'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [username, setUsername] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const handleRegister = async () => {
    if (!username.trim() || !email.trim() || !password.trim()) {
      setError('모든 항목을 입력해주세요.')
      return
    }
    if (username.trim().length < 2) {
      setError('아이디는 2자 이상이어야 합니다.')
      return
    }
    if (password.length < 6) {
      setError('비밀번호는 6자 이상이어야 합니다.')
      return
    }

    setLoading(true)
    setError('')

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { username: username.trim() } },
    })

    if (error) {
      const msg = error.message
      if (msg.includes('already registered') || msg.includes('already been registered')) {
        setError('이미 가입된 이메일입니다.')
      } else if (msg.includes('invalid') && msg.includes('email')) {
        setError('유효하지 않은 이메일 형식입니다.')
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
      setSuccess(true)
      setLoading(false)
    }
  }

  if (success) {
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
          width: '100%', maxWidth: 420, p: 4,
          border: '1px solid rgba(68,204,136,0.3)',
          boxShadow: '0 0 30px rgba(68,204,136,0.1)',
          borderRadius: 3, textAlign: 'center',
        }}>
          <DirectionsCarIcon sx={{ fontSize: 52, color: 'success.main', mb: 2 }} />
          <Typography variant="h6" fontWeight={700} color="success.main" mb={1}>
            회원가입 완료!
          </Typography>
          <Typography variant="body2" color="text.secondary" mb={3}>
            가입하신 이메일로 확인 메일이 발송되었습니다.
            이메일 인증 후 로그인해주세요.
          </Typography>
          <Button variant="contained" onClick={() => navigate('/login')} fullWidth>
            로그인 페이지로
          </Button>
        </Paper>
      </Box>
    )
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
            placeholder="2자 이상"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <PersonIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
                </InputAdornment>
              ),
            }}
          />

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
