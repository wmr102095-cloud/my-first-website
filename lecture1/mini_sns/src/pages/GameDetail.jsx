import { Box, Typography, Button, Chip, Divider } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DownloadIcon from '@mui/icons-material/Download'
import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import WindowsIcon from '@mui/icons-material/Window'
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid'
import SportsEsportsIcon from '@mui/icons-material/SportsEsports'
import { useParams, useNavigate } from 'react-router-dom'
import { NEXON_GAMES } from '../data/nexonGames'
import GameCard from '../components/GameCard'

const INSTALLED_IDS = ['first-descendant', 'maplestory', 'dungeon-fighter', 'fifa-online-4', 'kartrider-drift']

const PLATFORM_ICON = { Windows: <WindowsIcon sx={{ fontSize: '1rem' }} />, Mobile: <PhoneAndroidIcon sx={{ fontSize: '1rem' }} />, Console: <SportsEsportsIcon sx={{ fontSize: '1rem' }} /> }

export default function GameDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const game = NEXON_GAMES.find((g) => g.id === id)

  if (!game) {
    return (
      <Box sx={{ p: 4, textAlign: 'center' }}>
        <Typography color="text.secondary">게임을 찾을 수 없습니다.</Typography>
        <Button onClick={() => navigate('/')} sx={{ mt: 2 }}>스토어로 돌아가기</Button>
      </Box>
    )
  }

  const isInstalled = INSTALLED_IDS.includes(game.id)
  const similar = NEXON_GAMES.filter((g) => g.id !== game.id && g.genre.some((genre) => game.genre.includes(genre))).slice(0, 4)

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838' }}>
      {/* Hero */}
      <Box sx={{ position: 'relative', height: { xs: 200, md: 350 }, overflow: 'hidden' }}>
        {game.heroImg ? (
          <Box component="img" src={game.heroImg} alt={game.title} sx={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center' }} />
        ) : (
          <Box sx={{ position: 'absolute', inset: 0, background: game.gradient }} />
        )}
        <Box sx={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(27,40,56,1) 0%, rgba(27,40,56,0.3) 60%, transparent 100%)' }} />
        <Box sx={{ position: 'absolute', top: 12, left: 12 }}>
          <Button startIcon={<ArrowBackIcon />} onClick={() => navigate(-1)} sx={{ color: '#c6d4df', bgcolor: 'rgba(0,0,0,0.4)', '&:hover': { bgcolor: 'rgba(0,0,0,0.6)' } }}>
            뒤로
          </Button>
        </Box>
      </Box>

      <Box sx={{ p: { xs: 2, md: 4 } }}>
        <Box sx={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          {/* Left column */}
          <Box sx={{ flex: 1, minWidth: 280 }}>
            {/* Title */}
            <Typography sx={{ fontSize: { xs: '1.6rem', md: '2.2rem' }, fontWeight: 900, color: '#fff', mb: 0.5 }}>{game.title}</Typography>
            <Typography sx={{ fontSize: '0.9rem', color: '#8fa4b9', mb: 2 }}>{game.titleEn} · {game.developer}</Typography>

            {/* Tags */}
            <Box sx={{ display: 'flex', gap: 0.8, flexWrap: 'wrap', mb: 2.5 }}>
              {game.tags.map((tag) => (
                <Chip key={tag} label={tag} size="small" sx={{ bgcolor: '#2a475e', color: '#8fa4b9', border: '1px solid #3d6b8e', fontSize: '0.72rem' }} />
              ))}
            </Box>

            {/* Description */}
            <Typography sx={{ fontSize: '0.9rem', color: '#a8cfe8', lineHeight: 1.8, mb: 3 }}>
              {game.description}
            </Typography>

            <Divider sx={{ mb: 2.5 }} />

            {/* Meta info */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <MetaRow label="개발사" value={game.developer} />
              <MetaRow label="퍼블리셔" value={game.publisher} />
              <MetaRow label="출시일" value={game.releaseDate} />
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', width: 80 }}>지원 플랫폼</Typography>
                <Box sx={{ display: 'flex', gap: 0.8 }}>
                  {game.platforms.map((p) => (
                    <Box key={p} sx={{ display: 'flex', alignItems: 'center', gap: 0.3, color: '#c6d4df' }}>
                      {PLATFORM_ICON[p]}
                      <Typography sx={{ fontSize: '0.8rem' }}>{p}</Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Box>
          </Box>

          {/* Right column — purchase box */}
          <Box sx={{ width: { xs: '100%', md: 300 }, flexShrink: 0 }}>
            <Box sx={{ bgcolor: '#16202d', border: '1px solid #2a475e', borderRadius: 1, p: 2.5 }}>
              {/* Thumbnail */}
              <Box sx={{ aspectRatio: '460/215', borderRadius: 0.5, overflow: 'hidden', mb: 2, bgcolor: '#0e1620' }}>
                {game.headerImg ? (
                  <Box component="img" src={game.headerImg} alt={game.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <Box sx={{ width: '100%', height: '100%', background: game.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Typography sx={{ fontWeight: 900, color: game.accentColor, textAlign: 'center', px: 1 }}>{game.title}</Typography>
                  </Box>
                )}
              </Box>

              {/* Rating */}
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1.5 }}>
                <Box sx={{ display: 'flex', gap: 0.2 }}>
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Typography key={i} sx={{ fontSize: '0.9rem', color: i <= Math.round(game.rating / 20) ? '#66c0f4' : '#2a475e' }}>★</Typography>
                  ))}
                </Box>
                <Typography sx={{ fontSize: '0.8rem', color: '#8fa4b9' }}>{game.reviewCount}개 평가</Typography>
              </Box>

              {/* Price */}
              <Box sx={{ mb: 2 }}>
                {game.discount > 0 && (
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                    <Chip label={`-${game.discount}%`} size="small" sx={{ bgcolor: '#4c6b22', color: '#d9f5a5', fontWeight: 800, fontSize: '0.8rem' }} />
                    <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', textDecoration: 'line-through' }}>{game.originalPrice}</Typography>
                  </Box>
                )}
                <Typography sx={{ fontSize: '1.3rem', fontWeight: 900, color: game.price === '무료' ? '#5ba32b' : '#c6d4df' }}>
                  {game.price}
                </Typography>
              </Box>

              {/* Action button */}
              {isInstalled ? (
                <Button fullWidth variant="contained" color="success" startIcon={<PlayArrowIcon />} sx={{ height: 48, fontSize: '1rem', mb: 1 }}>
                  지금 플레이
                </Button>
              ) : game.price === '무료' ? (
                <Button fullWidth variant="contained" color="success" startIcon={<DownloadIcon />} sx={{ height: 48, fontSize: '1rem', mb: 1 }}>
                  무료 설치
                </Button>
              ) : (
                <Button fullWidth variant="contained" color="primary" sx={{ height: 48, fontSize: '1rem', mb: 1 }}>
                  장바구니에 추가
                </Button>
              )}
              <Button fullWidth variant="outlined" size="small" sx={{ borderColor: '#4c7b9a', color: '#8fa4b9', '&:hover': { borderColor: '#66c0f4', color: '#c6d4df' } }}>
                위시리스트 추가
              </Button>
            </Box>
          </Box>
        </Box>

        {/* Similar games */}
        {similar.length > 0 && (
          <Box sx={{ mt: 5 }}>
            <Typography sx={{ fontSize: '1.1rem', fontWeight: 700, color: '#c6d4df', mb: 2 }}>비슷한 게임</Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 2 }}>
              {similar.map((g) => (
                <GameCard key={g.id} game={g} size="sm" />
              ))}
            </Box>
          </Box>
        )}
      </Box>
    </Box>
  )
}

function MetaRow({ label, value }) {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
      <Typography sx={{ fontSize: '0.82rem', color: '#8fa4b9', width: 80, flexShrink: 0 }}>{label}</Typography>
      <Typography sx={{ fontSize: '0.82rem', color: '#c6d4df' }}>{value}</Typography>
    </Box>
  )
}
