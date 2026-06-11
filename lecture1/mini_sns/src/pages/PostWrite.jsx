import { useState, useEffect } from 'react'
import { Box, AppBar, Toolbar, IconButton, Typography, TextField, Button, CircularProgress, Alert } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY || ''

function buildFallbackImages() {
  return Array.from({ length: 9 }, (_, i) => ({
    id: `p${i}`,
    url: `https://picsum.photos/seed/${Date.now() + i * 7}/600/600`,
  }))
}

export default function PostWrite() {
  const [caption, setCaption] = useState('')
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { profile } = useAuth()

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    setLoading(true)
    setSelected(null)
    try {
      if (UNSPLASH_KEY) {
        const res = await fetch(`https://api.unsplash.com/photos/random?count=9&query=nature,city,art&client_id=${UNSPLASH_KEY}`)
        const data = await res.json()
        setImages(data.map(d => ({ id: d.id, url: d.urls.regular })))
      } else {
        await new Promise(r => setTimeout(r, 400))
        setImages(buildFallbackImages())
      }
    } catch {
      setImages(buildFallbackImages())
    }
    setLoading(false)
  }

  const handleSubmit = async () => {
    if (!selected) { setError('이미지를 선택해주세요.'); return }
    if (!caption.trim()) { setError('내용을 입력해주세요.'); return }
    if (!profile) return

    setSubmitting(true)
    setError('')
    const { error: err } = await supabase.from('sns_posts').insert({
      user_id: profile.id,
      caption: caption.trim(),
      image_url: selected,
    })
    if (err) { setError('게시 중 오류가 발생했습니다.'); setSubmitting(false); return }
    navigate('/')
  }

  return (
    <Box sx={{ bgcolor: '#fff', minHeight: '100vh', maxWidth: 600, mx: 'auto' }}>
      <AppBar position="sticky" elevation={0} sx={{ bgcolor: '#fff', borderBottom: '1px solid #dbdbdb' }}>
        <Toolbar sx={{ minHeight: 56, gap: 1 }}>
          <IconButton edge="start" onClick={() => navigate(-1)} sx={{ color: '#262626' }}>
            <ArrowBackIcon />
          </IconButton>
          <Typography fontWeight={700} fontSize="1rem" flex={1}>새 게시물</Typography>
          <Button
            size="small"
            onClick={handleSubmit}
            disabled={submitting || !selected || !caption.trim()}
            sx={{ color: '#0095f6', fontWeight: 700, fontSize: '0.95rem' }}
          >
            {submitting ? <CircularProgress size={18} /> : '공유'}
          </Button>
        </Toolbar>
      </AppBar>

      <Box sx={{ p: 2 }}>
        {error && <Alert severity="error" sx={{ mb: 2, borderRadius: 2 }}>{error}</Alert>}

        {/* 캡션 */}
        <TextField
          fullWidth
          multiline
          minRows={3}
          placeholder="문구를 입력하세요..."
          value={caption}
          onChange={e => { setCaption(e.target.value); setError('') }}
          inputProps={{ maxLength: 300 }}
          sx={{ mb: 0.5, '& .MuiOutlinedInput-root': { bgcolor: '#fafafa' } }}
        />
        <Typography variant="caption" color="text.secondary" display="block" textAlign="right" mb={2}>
          {caption.length}/300
        </Typography>

        {/* 이미지 선택 영역 */}
        {selected && (
          <Box sx={{ mb: 2, borderRadius: 2, overflow: 'hidden', border: '2px solid #0095f6', position: 'relative' }}>
            <Box component="img" src={selected} sx={{ width: '100%', height: 300, objectFit: 'cover', display: 'block' }} />
            <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#0095f6', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: '1.1rem', color: '#fff' }} />
            </Box>
          </Box>
        )}

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography fontWeight={700} fontSize="0.9rem">이미지 선택</Typography>
          <Button
            size="small"
            startIcon={loading ? <CircularProgress size={12} /> : <RefreshIcon sx={{ fontSize: '1rem' }} />}
            onClick={fetchImages}
            disabled={loading}
            sx={{ color: '#0095f6', fontSize: '0.78rem' }}
          >
            새로고침
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#0095f6' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {images.map(img => (
              <Box
                key={img.id}
                onClick={() => { setSelected(img.url); setError('') }}
                sx={{
                  position: 'relative',
                  paddingTop: '100%',
                  cursor: 'pointer',
                  outline: selected === img.url ? '3px solid #0095f6' : 'none',
                  outlineOffset: '-3px',
                }}
              >
                <Box
                  component="img"
                  src={img.url}
                  sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }}
                />
                {selected === img.url && (
                  <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: '#0095f6', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#fff' }} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}

        {!UNSPLASH_KEY && (
          <Typography variant="caption" color="text.secondary" display="block" textAlign="center" mt={2} sx={{ opacity: 0.7 }}>
            💡 VITE_UNSPLASH_KEY를 설정하면 실제 이미지를 사용할 수 있어요
          </Typography>
        )}
      </Box>
    </Box>
  )
}
