import { useState, useEffect } from 'react'
import { Box, Typography, TextField, Button, CircularProgress, Alert, Chip, IconButton, Autocomplete } from '@mui/material'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import RefreshIcon from '@mui/icons-material/Refresh'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useNavigate, useLocation } from 'react-router-dom'
import { supabase } from '../supabaseClient'
import { useAuth } from '../context/AuthContext'
import { NEXON_GAMES } from '../data/nexonGames'

const UNSPLASH_KEY = import.meta.env.VITE_UNSPLASH_KEY || ''

function buildFallbackImages() {
  return Array.from({ length: 9 }, (_, i) => ({
    id: `p${i}`,
    url: `https://picsum.photos/seed/${Date.now() + i * 7}/600/600`,
  }))
}

export default function PostWrite() {
  const location = useLocation()
  const [caption, setCaption] = useState('')
  const [images, setImages] = useState([])
  const [selected, setSelected] = useState(null)
  const [loading, setLoading] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [gameId, setGameId] = useState(location.state?.gameId || null)
  const navigate = useNavigate()
  const { profile } = useAuth()

  const selectedGame = NEXON_GAMES.find((g) => g.id === gameId) || null

  useEffect(() => { fetchImages() }, [])

  const fetchImages = async () => {
    setLoading(true)
    setSelected(null)
    try {
      if (UNSPLASH_KEY) {
        const res = await fetch(`https://api.unsplash.com/photos/random?count=9&query=gaming,esports,game&client_id=${UNSPLASH_KEY}`)
        const data = await res.json()
        setImages(data.map((d) => ({ id: d.id, url: d.urls.regular })))
      } else {
        await new Promise((r) => setTimeout(r, 400))
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
      game_id: gameId || null,
    })
    if (err) { setError('게시 중 오류가 발생했습니다.'); setSubmitting(false); return }

    if (gameId) navigate(`/game/${gameId}`, { state: { tab: 'community' } })
    else navigate('/community')
  }

  return (
    <Box sx={{ bgcolor: '#1b2838', minHeight: '100vh' }}>
      {/* Header */}
      <Box sx={{ display: 'flex', alignItems: 'center', px: 2, py: 1.5, borderBottom: '1px solid #2a475e', bgcolor: '#16202d', position: 'sticky', top: 0, zIndex: 10 }}>
        <IconButton onClick={() => navigate(-1)} sx={{ color: '#c6d4df', mr: 1 }}>
          <ArrowBackIcon />
        </IconButton>
        <Typography sx={{ fontWeight: 700, fontSize: '1rem', color: '#c6d4df', flex: 1 }}>새 게시물</Typography>
        <Button
          size="small"
          onClick={handleSubmit}
          disabled={submitting || !selected || !caption.trim()}
          sx={{ color: '#66c0f4', fontWeight: 700, fontSize: '0.95rem', '&:disabled': { color: '#4c7b9a' } }}
        >
          {submitting ? <CircularProgress size={18} sx={{ color: '#66c0f4' }} /> : '공유'}
        </Button>
      </Box>

      <Box sx={{ p: 2, maxWidth: 600, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2, bgcolor: 'rgba(231,76,60,0.15)', color: '#e74c3c', border: '1px solid rgba(231,76,60,0.3)', '& .MuiAlert-icon': { color: '#e74c3c' } }}>
            {error}
          </Alert>
        )}

        {/* 게임 선택 */}
        <Box sx={{ mb: 2 }}>
          <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', mb: 1, fontWeight: 600 }}>
            <SportsEsportsIcon sx={{ fontSize: '0.9rem', mr: 0.5, verticalAlign: 'middle' }} />
            게임 태그 (선택)
          </Typography>
          {selectedGame ? (
            <Chip
              icon={<SportsEsportsIcon sx={{ fontSize: '0.9rem', color: `${selectedGame.accentColor} !important` }} />}
              label={selectedGame.title}
              onDelete={() => setGameId(null)}
              sx={{ bgcolor: 'rgba(42,71,94,0.5)', color: selectedGame.accentColor, border: `1px solid ${selectedGame.accentColor}40`, fontWeight: 700 }}
            />
          ) : (
            <Autocomplete
              options={NEXON_GAMES}
              getOptionLabel={(g) => g.title}
              onChange={(_, v) => setGameId(v?.id || null)}
              renderOption={(props, g) => (
                <Box component="li" {...props} sx={{ display: 'flex', alignItems: 'center', gap: 1.5, bgcolor: '#16202d !important', color: '#c6d4df', '&:hover': { bgcolor: '#2a475e !important' } }}>
                  <Box sx={{ width: 24, height: 24, borderRadius: 0.5, background: g.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <SportsEsportsIcon sx={{ fontSize: '0.75rem', color: g.accentColor }} />
                  </Box>
                  <Typography sx={{ fontSize: '0.88rem' }}>{g.title}</Typography>
                </Box>
              )}
              renderInput={(params) => (
                <TextField {...params} placeholder="게임을 검색하세요..." size="small"
                  sx={{ '& .MuiOutlinedInput-root': { bgcolor: '#16202d' } }}
                />
              )}
              PaperComponent={({ children }) => (
                <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, mt: 0.5 }}>{children}</Box>
              )}
            />
          )}
        </Box>

        {/* 캡션 */}
        <TextField
          fullWidth multiline minRows={3}
          placeholder="게임에 대한 이야기를 들려주세요..."
          value={caption}
          onChange={(e) => { setCaption(e.target.value); setError('') }}
          inputProps={{ maxLength: 300 }}
          sx={{ mb: 0.5 }}
        />
        <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9', textAlign: 'right', mb: 2 }}>
          {caption.length}/300
        </Typography>

        {/* 선택된 이미지 미리보기 */}
        {selected && (
          <Box sx={{ mb: 2, borderRadius: 1, overflow: 'hidden', border: '2px solid #66c0f4', position: 'relative' }}>
            <Box component="img" src={selected} sx={{ width: '100%', height: 280, objectFit: 'cover', display: 'block' }} />
            <Box sx={{ position: 'absolute', top: 8, right: 8, bgcolor: '#66c0f4', borderRadius: '50%', width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <CheckCircleIcon sx={{ fontSize: '1.1rem', color: '#1b2838' }} />
            </Box>
          </Box>
        )}

        {/* 이미지 선택 */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
          <Typography sx={{ fontWeight: 700, fontSize: '0.9rem', color: '#c6d4df' }}>이미지 선택</Typography>
          <Button
            size="small"
            startIcon={loading ? <CircularProgress size={12} sx={{ color: '#66c0f4' }} /> : <RefreshIcon sx={{ fontSize: '1rem' }} />}
            onClick={fetchImages}
            disabled={loading}
            sx={{ color: '#66c0f4', fontSize: '0.78rem' }}
          >
            새로고침
          </Button>
        </Box>

        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress size={24} sx={{ color: '#66c0f4' }} />
          </Box>
        ) : (
          <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '2px' }}>
            {images.map((img) => (
              <Box
                key={img.id}
                onClick={() => { setSelected(img.url); setError('') }}
                sx={{ position: 'relative', paddingTop: '100%', cursor: 'pointer', outline: selected === img.url ? '3px solid #66c0f4' : 'none', outlineOffset: '-3px' }}
              >
                <Box component="img" src={img.url} sx={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                {selected === img.url && (
                  <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: '#66c0f4', borderRadius: '50%', width: 22, height: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CheckCircleIcon sx={{ fontSize: '0.9rem', color: '#1b2838' }} />
                  </Box>
                )}
              </Box>
            ))}
          </Box>
        )}
      </Box>
    </Box>
  )
}
