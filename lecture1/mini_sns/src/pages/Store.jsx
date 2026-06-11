import { useState, useMemo } from 'react'
import { Box, Typography, Button, Chip, TextField, InputAdornment, Grid, ToggleButton, ToggleButtonGroup, Divider } from '@mui/material'
import SearchIcon from '@mui/icons-material/Search'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import AddIcon from '@mui/icons-material/Add'
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh'
import GpsFixedIcon from '@mui/icons-material/GpsFixed'
import DirectionsCarIcon from '@mui/icons-material/DirectionsCar'
import SportsSoccerIcon from '@mui/icons-material/SportsSoccer'
import SportsMartialArtsIcon from '@mui/icons-material/SportsMartialArts'
import TagFacesIcon from '@mui/icons-material/TagFaces'
import AppsIcon from '@mui/icons-material/Apps'
import { useNavigate } from 'react-router-dom'
import { NEXON_GAMES, FEATURED_GAME } from '../data/nexonGames'
import GameCard from '../components/GameCard'

// ── 카테고리 정의 ──────────────────────────────────────────
const CATEGORIES = [
  { key: '전체', label: '전체', icon: <AppsIcon sx={{ fontSize: '1rem' }} /> },
  { key: 'RPG', label: 'RPG', icon: <AutoFixHighIcon sx={{ fontSize: '1rem' }} /> },
  { key: 'FPS', label: 'FPS', icon: <GpsFixedIcon sx={{ fontSize: '1rem' }} /> },
  { key: '레이싱', label: '레이싱', icon: <DirectionsCarIcon sx={{ fontSize: '1rem' }} /> },
  { key: '스포츠', label: '스포츠', icon: <SportsSoccerIcon sx={{ fontSize: '1rem' }} /> },
  { key: '격투', label: '격투', icon: <SportsMartialArtsIcon sx={{ fontSize: '1rem' }} /> },
  { key: '캐주얼', label: '캐주얼', icon: <TagFacesIcon sx={{ fontSize: '1rem' }} /> },
]

function getMainCategory(game) {
  const g = game.genre.join(' ').toLowerCase()
  if (g.includes('fps') || g.includes('슈팅')) return 'FPS'
  if (g.includes('레이싱')) return '레이싱'
  if (g.includes('스포츠') || g.includes('축구')) return '스포츠'
  if (g.includes('격투')) return '격투'
  if (g.includes('캐주얼') || g.includes('샌드박스') || g.includes('메타버스') || g.includes('아케이드') || g.includes('어드벤처')) return '캐주얼'
  return 'RPG'
}

export default function Store() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('전체')
  const [priceFilter, setPriceFilter] = useState('전체')
  const navigate = useNavigate()
  const featured = FEATURED_GAME

  const isFiltered = search !== '' || category !== '전체' || priceFilter !== '전체'

  // 필터링된 게임 목록
  const filtered = useMemo(() => NEXON_GAMES.filter((g) => {
    const matchSearch = g.title.includes(search) || g.titleEn.toLowerCase().includes(search.toLowerCase())
    const matchCat = category === '전체' || getMainCategory(g) === category
    const matchPrice = priceFilter === '전체' ||
      (priceFilter === '무료' && g.price === '무료') ||
      (priceFilter === '유료' && g.price !== '무료')
    return matchSearch && matchCat && matchPrice
  }), [search, category, priceFilter])

  // 섹션별 그룹 (필터 없을 때)
  const sections = useMemo(() => CATEGORIES.slice(1).map((cat) => ({
    ...cat,
    games: NEXON_GAMES.filter((g) => getMainCategory(g) === cat.key),
  })).filter((s) => s.games.length > 0), [])

  // 카테고리별 게임 수 (뱃지용)
  const catCount = useMemo(() => {
    const m = {}
    NEXON_GAMES.forEach((g) => {
      const c = getMainCategory(g)
      m[c] = (m[c] || 0) + 1
    })
    return m
  }, [])

  // 무료 / 유료 수
  const freeCount = NEXON_GAMES.filter((g) => g.price === '무료').length
  const paidCount = NEXON_GAMES.filter((g) => g.price !== '무료').length

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* ── Featured Banner ── */}
      <Box sx={{ position: 'relative', height: { xs: 260, md: 400 }, overflow: 'hidden' }}>
        {featured.heroImg ? (
          <Box component="img" src={featured.heroImg} alt={featured.title}
            sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center right' }} />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: featured.gradient }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to right, rgba(27,40,56,1) 28%, rgba(27,40,56,0.65) 52%, rgba(27,40,56,0.05) 100%)' }} />
        <Box sx={{ position: 'relative', height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', p: { xs: 3, md: 5 }, maxWidth: '55%' }}>
          <Box sx={{ display: 'flex', gap: 0.8, mb: 1.5, flexWrap: 'wrap' }}>
            {featured.genre.map((g) => (
              <Chip key={g} label={g} size="small" sx={{ bgcolor: 'rgba(102,192,244,0.15)', color: '#66c0f4', border: '1px solid rgba(102,192,244,0.3)', fontSize: '0.72rem' }} />
            ))}
          </Box>
          <Typography sx={{ fontSize: { xs: '1.8rem', md: '2.6rem' }, fontWeight: 900, color: '#fff', lineHeight: 1.1, mb: 1, textShadow: '0 2px 8px rgba(0,0,0,0.5)' }}>
            {featured.title}
          </Typography>
          <Typography sx={{ fontSize: '0.88rem', color: '#a8cfe8', mb: 2, display: { xs: 'none', md: 'block' }, maxWidth: 440 }}>
            {featured.shortDesc}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2.5 }}>
            <Typography sx={{ fontSize: '0.85rem', color: '#66c0f4', fontWeight: 700 }}>★ {featured.rating}%</Typography>
            <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9' }}>({featured.reviewCount}개 평가)</Typography>
          </Box>
          <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', flexWrap: 'wrap' }}>
            <Button variant="contained" color="success" startIcon={<PlayArrowIcon />} onClick={() => navigate(`/game/${featured.id}`)} sx={{ height: 42, px: 2.5, fontSize: '0.92rem' }}>
              지금 플레이
            </Button>
            <Button variant="outlined" startIcon={<AddIcon />} onClick={() => navigate(`/game/${featured.id}`)}
              sx={{ height: 42, px: 2, borderColor: '#4c7b9a', color: '#c6d4df', '&:hover': { borderColor: '#66c0f4', bgcolor: 'rgba(102,192,244,0.08)' } }}>
              라이브러리 추가
            </Button>
            <Typography sx={{ fontSize: '0.85rem', color: '#5ba32b', fontWeight: 700 }}>{featured.price}</Typography>
          </Box>
        </Box>
      </Box>

      {/* ── 필터 바 ── */}
      <Box sx={{ bgcolor: '#16202d', borderBottom: '1px solid #2a475e', px: { xs: 2, md: 4 }, py: 2 }}>
        {/* Row 1: 검색 + 무료/유료 */}
        <Box sx={{ display: 'flex', gap: 2, mb: 2, flexWrap: 'wrap', alignItems: 'center' }}>
          <TextField
            placeholder="게임 검색..."
            size="small"
            value={search}
            onChange={(e) => { setSearch(e.target.value) }}
            InputProps={{ startAdornment: <InputAdornment position="start"><SearchIcon sx={{ color: '#8fa4b9', fontSize: '1.1rem' }} /></InputAdornment> }}
            sx={{ width: 240 }}
          />

          {/* 무료/유료 토글 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, ml: 'auto' }}>
            <Typography sx={{ fontSize: '0.78rem', color: '#8fa4b9', fontWeight: 600 }}>가격</Typography>
            <Box sx={{ display: 'flex', border: '1px solid #2a475e', borderRadius: 1, overflow: 'hidden' }}>
              {[
                { v: '전체', label: `전체 (${NEXON_GAMES.length})` },
                { v: '무료', label: `무료 (${freeCount})` },
                { v: '유료', label: `유료 (${paidCount})` },
              ].map(({ v, label }) => (
                <Box
                  key={v}
                  onClick={() => setPriceFilter(v)}
                  sx={{
                    px: 1.5, py: 0.6, cursor: 'pointer', fontSize: '0.8rem', fontWeight: 600,
                    bgcolor: priceFilter === v ? '#2a475e' : 'transparent',
                    color: priceFilter === v
                      ? (v === '무료' ? '#5ba32b' : v === '유료' ? '#f59e0b' : '#66c0f4')
                      : '#8fa4b9',
                    borderRight: v !== '유료' ? '1px solid #2a475e' : 'none',
                    transition: 'all 0.15s',
                    '&:hover': { bgcolor: '#2a475e' },
                  }}
                >
                  {label}
                </Box>
              ))}
            </Box>
          </Box>
        </Box>

        {/* Row 2: 카테고리 */}
        <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap' }}>
          {CATEGORIES.map((cat) => {
            const count = cat.key === '전체' ? NEXON_GAMES.length : (catCount[cat.key] || 0)
            const active = category === cat.key
            return (
              <Box
                key={cat.key}
                onClick={() => setCategory(cat.key)}
                sx={{
                  display: 'flex', alignItems: 'center', gap: 0.6,
                  px: 1.4, py: 0.55, borderRadius: 1, cursor: 'pointer',
                  border: `1px solid ${active ? '#66c0f4' : '#2a475e'}`,
                  bgcolor: active ? '#2a475e' : 'transparent',
                  color: active ? '#66c0f4' : '#8fa4b9',
                  transition: 'all 0.15s',
                  '&:hover': { bgcolor: '#2a475e', borderColor: '#4c7b9a' },
                  userSelect: 'none',
                }}
              >
                <Box sx={{ color: 'inherit', display: 'flex', alignItems: 'center' }}>{cat.icon}</Box>
                <Typography sx={{ fontSize: '0.82rem', fontWeight: active ? 700 : 400 }}>{cat.label}</Typography>
                <Box sx={{
                  bgcolor: active ? '#66c0f460' : '#2a475e',
                  color: active ? '#66c0f4' : '#8fa4b9',
                  fontSize: '0.68rem', fontWeight: 700,
                  px: 0.6, borderRadius: 0.5, lineHeight: 1.6,
                }}>
                  {count}
                </Box>
              </Box>
            )
          })}
        </Box>
      </Box>

      {/* ── 콘텐츠 영역 ── */}
      <Box sx={{ p: { xs: 2, md: 4 } }}>
        {isFiltered ? (
          /* 필터 적용 시: 플랫 그리드 */
          <>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2.5 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                {category !== '전체' && CATEGORIES.find(c => c.key === category)?.icon && (
                  <Box sx={{ color: '#66c0f4' }}>{CATEGORIES.find(c => c.key === category)?.icon}</Box>
                )}
                <Typography sx={{ fontSize: '1.05rem', fontWeight: 700, color: '#c6d4df' }}>
                  {category !== '전체' ? category : '전체'}
                  {priceFilter !== '전체' && <Box component="span" sx={{ color: priceFilter === '무료' ? '#5ba32b' : '#f59e0b', ml: 0.8 }}>{priceFilter}</Box>}
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9' }}>{filtered.length}개 타이틀</Typography>
                {isFiltered && (
                  <Chip
                    label="필터 초기화"
                    size="small"
                    onClick={() => { setSearch(''); setCategory('전체'); setPriceFilter('전체') }}
                    sx={{ fontSize: '0.72rem', bgcolor: 'transparent', color: '#8fa4b9', border: '1px solid #2a475e', cursor: 'pointer', '&:hover': { bgcolor: '#2a475e' } }}
                  />
                )}
              </Box>
            </Box>

            {filtered.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 8 }}>
                <Typography sx={{ color: '#8fa4b9', mb: 1 }}>검색 결과가 없습니다.</Typography>
                <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9' }}>다른 필터를 시도해보세요.</Typography>
              </Box>
            ) : (
              <Grid container spacing={2}>
                {filtered.map((game) => (
                  <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                    <GameCard game={game} />
                  </Grid>
                ))}
              </Grid>
            )}
          </>
        ) : (
          /* 필터 없을 때: 섹션별 그룹 뷰 */
          <>
            {sections.map((section, idx) => (
              <Box key={section.key} sx={{ mb: 5 }}>
                {/* 섹션 헤더 */}
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.2 }}>
                    <Box sx={{
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      width: 32, height: 32, borderRadius: 1,
                      bgcolor: '#2a475e', color: '#66c0f4',
                    }}>
                      {section.icon}
                    </Box>
                    <Typography sx={{ fontSize: '1.15rem', fontWeight: 800, color: '#c6d4df' }}>
                      {section.label}
                    </Typography>
                    <Box sx={{ bgcolor: '#2a475e', color: '#8fa4b9', fontSize: '0.72rem', fontWeight: 700, px: 0.8, py: 0.2, borderRadius: 0.5 }}>
                      {section.games.length}
                    </Box>
                    {/* 무료/유료 소분류 표시 */}
                    <Box sx={{ display: 'flex', gap: 0.5, ml: 0.5 }}>
                      {(() => {
                        const freeN = section.games.filter(g => g.price === '무료').length
                        const paidN = section.games.filter(g => g.price !== '무료').length
                        return (
                          <>
                            {freeN > 0 && <Chip label={`무료 ${freeN}`} size="small" onClick={() => { setCategory(section.key); setPriceFilter('무료') }} sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#1b3a1b', color: '#5ba32b', border: '1px solid #2d5a2d', cursor: 'pointer', '&:hover': { bgcolor: '#2d5a2d' } }} />}
                            {paidN > 0 && <Chip label={`유료 ${paidN}`} size="small" onClick={() => { setCategory(section.key); setPriceFilter('유료') }} sx={{ fontSize: '0.68rem', height: 20, bgcolor: '#2a2200', color: '#f59e0b', border: '1px solid #4a3a00', cursor: 'pointer', '&:hover': { bgcolor: '#4a3a00' } }} />}
                          </>
                        )
                      })()}
                    </Box>
                  </Box>
                  <Button
                    size="small"
                    onClick={() => setCategory(section.key)}
                    sx={{ fontSize: '0.78rem', color: '#66c0f4', '&:hover': { bgcolor: '#2a475e' } }}
                  >
                    전체 보기
                  </Button>
                </Box>

                {/* 게임 그리드 */}
                <Grid container spacing={1.5}>
                  {section.games.map((game) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={game.id}>
                      <GameCard game={game} />
                    </Grid>
                  ))}
                </Grid>

                {idx < sections.length - 1 && <Divider sx={{ mt: 4, borderColor: '#2a475e' }} />}
              </Box>
            ))}
          </>
        )}
      </Box>
    </Box>
  )
}
