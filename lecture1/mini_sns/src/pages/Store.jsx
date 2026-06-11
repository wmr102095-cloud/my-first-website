import { useState } from 'react'
import { Box, Typography, Button, Chip, TextField, InputAdornment, Grid } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AddIcon from '@mui/icons-material/Add'
import { useNavigate } from 'react-router-dom'
import { NEXON_GAMES, FEATURED_GAME } from '../data/nexonGames'
import GameCard from '../components/GameCard'

const GENRES = ['전체', 'MMORPG', '액션 RPG', '루트 슈터', 'FPS', '레이싱', '스포츠', '대전 격투']

export default function Store() {
  const [search, setSearch] = useState('')
  const [genre, setGenre] = useState('전체')
  const navigate = useNavigate()

  const featured = FEATURED_GAME

  const filtered = NEXON_GAMES.filter((g) => {
    const matchSearch = g.title.includes(search) || g.titleEn.toLowerCase().includes(search.toLowerCase())
    const matchGenre = genre === '전체' || g.genre.includes(genre)
    return matchSearch && matchGenre
  })

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* ── Featured Banner ── */}
      <Box sx={{ position: 'relative', height: { xs: 280, md: 420 }, overflow: 'hidden' }}>
        {/* Background art */}
        {featured.heroImg ? (
          <Box
            component="img"
            src={featured.heroImg}
            alt={featured.title}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }}
          />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: featured.gradient }} />
        )}
        {/* Gradient overlay */}
        <Box sx={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(to right, rgba(27,40,56,1) 30%, rgba(27,40,56,0.7) 55%, rgba(27,40,56,0.1) 100%)',
        }} />

        {/* Content */}
        <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { xs: 3, md: 5 }, maxWidth: '55%' }}>
          {/* Genre tags */}
          <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
            {featured.genre.map((g) => (
              <Chip key={g} label={g} size="small" sx={{ bgcolor: 'rgba(102,192,244,0.15)', color: '#66c0f4', border: '1px solid rgba(102,192,244,0.3)', fontSize: '0.72rem' }} />
            ))}
          </Box>
          {/* Title */}
          <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.8rem' }, fontWeight: 900, color: '#fff', lineHeight: 1.1, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {featured.title}
          </Typography>
          {/* Short description */}
          <Typography sx={{ fontSize: '0.9rem', color: '#a8cfe8', mb: 2, display: { xs: 'none', md: 'block' }, maxWidth: 460 }}>
            {featured.shortDesc}
          </Typography>
          {/* Rating */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#66c0f4', fontWeight: 700 }}>★ {featured.rating}%</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9' }}>({featured.reviewCount}개 평가)</Typography>
          </Box>
          {/* Buttons */}
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button
              variant="contained"
              color="success"
              startIcon={<PlayArrowIcon />}
              onClick={() => navigate(`/game/${featured.id}`)}
              sx={{ height: 44, px: 3, fontSize: '0.95rem' }}
            >
              지금 플레이
            </Button>
            <Button
              variant="outlined"
              startIcon={<AddIcon />}
              onClick={() => navigate(`/game/${featured.id}`)}
              sx={{ height: 44, px: 2.5, borderColor: '#4c7b9a', color: '#c6d4df', '&:hover': { borderColor: '#66c0f4', bgcolor: 'rgba(102,192,244,0.08)' } }}
            >
              라이브러리 추가
            </Button>
            <Typography sx={{ fontSize: '0.85rem', color: '#5ba32b', fontWeight: 700, ml: 0.5 }}>
              {featured.price}
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {/* ── Search + Filter ── */}
        <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="게임 검색..."
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8fa4b9', fontSize: '1.1rem' }} /></InputAdornment> }}
            sx={{ width: 260 }}
          />
          <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
            {GENRES.map((g) => (
              <Chip
                key={g}
                label={g}
                size="small"
                onClick={() => setGenre(g)}
                sx={{
                  cursor: 'pointer',
                  bgcolor: genre === g ? '#2a475e' : 'transparent',
                  color: genre === g ? '#66c0f4' : '#8fa4b9',
                  border: `1px solid ${genre === g ? '#66c0f4' : '#2a475e'}`,
                  '&:hover': { bgcolor: '#2a475e' },
                }}
              />
            ))}
          </Box>
        </Box>

        {/* ── Games Grid ── */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#c6d4df' }}>
            {genre === '전체' ? '넥슨 전체 게임' : genre}
          </Typography>
          <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9' }}>{filtered.length}개 타이틀</Typography>
        </Box>

        <Grid container spacing={2}>
          {filtered.map((game) => (
            <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
              <GameCard game={game} />
            </Grid>
          ))}
        </Grid>

        {filtered.length === 0 && (
          <Box sx={{ textAlign: 'center', py: 8 }}>
            <Typography sx={{ color: '#8fa4b9' }}>검색 결과가 없습니다.</Typography>
          </Box>
        )}
      </Box>
    </Box>
  )
}
