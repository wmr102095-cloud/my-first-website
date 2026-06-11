import { useState } from 'react'
import { Box, Typography, TextField, Button, Alert, CircularProgress, LinearProgress } from '@mui/material'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'

export default function Register() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ email: '', password: '', confirm: '', username: '', displayName: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  const set = (k) => (e) => { setForm(f => ({ ...f, [k]: e.target.value })); setError('') }

  const handleStep1 = () => {
    if (!form.email || !form.password || !form.confirm) { setError('모든 항목을 입력해주세요.'); return }
    if (form.password !== form.confirm) { setError('비밀번호가 일치하지 않습니다.'); return }
    if (form.password.length < 6) { setError('비밀번호는 6자 이상이어야 합니다.'); return }
    setStep(2)
  }

  const handleRegister = async () => {
    if (!form.username || !form.displayName) { setError('모든 항목을 입력해주세요.'); return }
    if (!/^[a-z0-9_.]{3,20}$/.test(form.username)) {
      setError('사용자명은 3~20자 영문 소문자, 숫자, ., _ 만 사용 가능합니다.')
      return
    }
    setLoading(true)
    setError('')

    // 1단계: Supabase Auth 회원가입
    const { data: authData, error: signUpErr } = await supabase.auth.signUp({
      email: form.email,
      password: form.password,
    })
    if (signUpErr) { setError(signUpErr.message); setLoading(false); return }

    // 2단계: sns_users 프로필 생성
    const { error: profileErr } = await supabase.from('sns_users').insert({
      auth_id: authData.user.id,
      username: form.username,
      email: form.email,
      display_name: form.displayName,
    })
    if (profileErr) {
      setError(profileErr.message.includes('username') ? '이미 사용 중인 사용자명입니다.' : profileErr.message)
      setLoading(false)
      return
    }

    navigate('/')
    setLoading(false)
  }

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#fafafa', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', px: 3 }}>
      <Box sx={{ width: '100%', maxWidth: 360 }}>
        <Box sx={{ bgcolor: '#fff', border: '1px solid #dbdbdb', borderRadius: 2, p: 4, mb: 2 }}>
          <Typography sx={{ fontFamily: '"Grand Hotel", cursive', fontSize: '2.8rem', color: '#262626', mb: 0.5, letterSpacing: '0.02em', textAlign: 'center' }}>
            MiniSNS
          </Typography>
          <Typography color="text.secondary" fontSize="0.9rem" fontWeight={600} textAlign="center" mb={3}>
            친구들의 사진과 동영상을 확인하세요.
          </Typography>

          <LinearProgress
            variant="determinate"
            value={step === 1 ? 50 : 100}
            sx={{ mb: 3, borderRadius: 2, height: 3, bgcolor: '#dbdbdb', '& .MuiLinearProgress-bar': { bgcolor: '#0095f6' } }}
          />

          {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2, fontSize: '0.82rem' }}>{error}</Alert>}

          {step === 1 ? (
            <Box>
              <TextField fullWidth placeholder="이메일" type="email" size="small" value={form.email} onChange={set('email')} sx={{ mb: 1.5 }} />
              <TextField fullWidth placeholder="비밀번호 (6자 이상)" type="password" size="small" value={form.password} onChange={set('password')} sx={{ mb: 1.5 }} />
              <TextField fullWidth placeholder="비밀번호 확인" type="password" size="small" value={form.confirm} onChange={set('confirm')} sx={{ mb: 2 }}
                onKeyDown={e => e.key === 'Enter' && handleStep1()} />
              <Button fullWidth variant="contained" onClick={handleStep1}
                sx={{ height: 40, borderRadius: 2, bgcolor: '#0095f6', '&:hover': { bgcolor: '#1877f2' } }}>
                다음
              </Button>
            </Box>
          ) : (
            <Box>
              <TextField fullWidth placeholder="사용자명 (영문, 숫자, _, .)" size="small" value={form.username} onChange={set('username')} sx={{ mb: 1.5 }} />
              <TextField fullWidth placeholder="표시 이름" size="small" value={form.displayName} onChange={set('displayName')} sx={{ mb: 2 }}
                onKeyDown={e => e.key === 'Enter' && handleRegister()} />
              <Button fullWidth variant="contained" onClick={handleRegister} disabled={loading}
                sx={{ height: 40, borderRadius: 2, bgcolor: '#0095f6', '&:hover': { bgcolor: '#1877f2' } }}>
                {loading ? <CircularProgress size={20} sx={{ color: '#fff' }} /> : '가입하기'}
              </Button>
              <Button fullWidth onClick={() => setStep(1)} sx={{ mt: 1, color: 'text.secondary', fontSize: '0.85rem' }}>
                이전
              </Button>
            </Box>
          )}
        </Box>

        <Box sx={{ bgcolor: '#fff', border: '1px solid #dbdbdb', borderRadius: 2, p: 3, textAlign: 'center' }}>
          <Typography variant="body2" fontSize="0.9rem">
            계정이 있으신가요?{' '}
            <Typography component="span" onClick={() => navigate('/login')}
              sx={{ color: '#0095f6', fontWeight: 700, cursor: 'pointer', fontSize: '0.9rem' }}>
              로그인
            </Typography>
          </Typography>
        </Box>
      </Box>
    </Box>
  )
}
