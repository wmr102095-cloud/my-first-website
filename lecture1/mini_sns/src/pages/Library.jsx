import { Box, Typography, Button, LinearProgress, Chip } from '@mui/material'
import PlayArrowIcon from '@mui/icons-material/PlayArrow'
import DownloadIcon from '@mui/icons-material/Download'
import StorefrontIcon from '@mui/icons-material/Storefront'
import { useNavigate } from 'react-router-dom'
import { NEXON_GAMES } from '../data/nexonGames'

// First 5 games are "installed/playable", rest are available to download
const INSTALLED_IDS = ['first-descendant', 'maplestory', 'dungeon-fighter', 'fifa-online-4', 'kartrider-drift']

export default function Library() {
  const navigate = useNavigate()
  const installed = NEXON_GAMES.filter((g) => INSTALLED_IDS.includes(g.id))
  const available = NEXON_GAMES.filter((g) => !INSTALLED_IDS.includes(g.id))

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#1b2838', p: { xs: 2, md: 4 } }}>
      <Typography sx={{ fontSize: '1.4rem', fontWeight: 700, color: '#c6d4df', mb: 0.5 }}>라이브러리</Typography>
      <Typography sx={{ fontSize: '0.85rem', color: '#8fa4b9', mb: 3 }}>내 게임 목록</Typography>

      {/* Installed games */}
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#66c0f4', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>
        설치된 게임 ({installed.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 4 }}>
        {installed.map((game) => (
          <LibraryRow key={game.id} game={game} installed navigate={navigate} />
        ))}
      </Box>

      {/* Available games */}
      <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: '#8fa4b9', letterSpacing: '0.08em', textTransform: 'uppercase', mb: 1.5 }}>
        다운로드 가능 ({available.length})
      </Typography>
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {available.map((game) => (
          <LibraryRow key={game.id} game={game} installed={false} navigate={navigate} />
        ))}
      </Box>
    </Box>
  )
}

function LibraryRow({ game, installed, navigate }) {
  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        bgcolor: '#16202d',
        border: '1px solid #2a475e',
        borderRadius: 1,
        p: 1.5,
        cursor: 'pointer',
        transition: 'background 0.15s, border-color 0.15s',
        '&:hover': { bgcolor: '#1e2d3d', borderColor: '#66c0f4' },
      }}
      onClick={() => navigate(`/game/${game.id}`)}
    >
      {/* Thumbnail */}
      <Box sx={{ width: 120, height: 56, borderRadius: 0.5, overflow: 'hidden', flexShrink: 0, bgcolor: '#0e1620' }}>
        {game.headerImg ? (
          <Box component="img" src={game.headerImg} alt={game.title} sx={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <Box sx={{ width: '100%', height: '100%', background: game.gradient, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Typography sx={{ fontSize: '0.65rem', fontWeight: 800, color: game.accentColor, textAlign: 'center', px: 0.5, lineHeight: 1.2 }}>
              {game.title}
            </Typography>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ flex: 1, minWidth: 0 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.3 }}>
          <Typography sx={{ fontSize: '0.95rem', fontWeight: 700, color: '#c6d4df' }}>{game.title}</Typography>
          {installed && (
            <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#5ba32b', flexShrink: 0 }} />
          )}
        </Box>
        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          {game.genre.map((g) => (
            <Typography key={g} sx={{ fontSize: '0.72rem', color: '#8fa4b9' }}>{g}</Typography>
          ))}
          <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9' }}>·</Typography>
          <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9' }}>★ {game.rating}%</Typography>
        </Box>
      </Box>

      {/* Action buttons */}
      <Box sx={{ display: 'flex', gap: 1, flexShrink: 0 }} onClick={(e) => e.stopPropagation()}>
        {installed ? (
          <Button
            variant="contained"
            color="success"
            size="small"
            startIcon={<PlayArrowIcon />}
            sx={{ fontSize: '0.8rem', height: 34 }}
          >
            플레이
          </Button>
        ) : (
          <>
            <Button
              variant="outlined"
              size="small"
              startIcon={<DownloadIcon />}
              sx={{ fontSize: '0.8rem', height: 34, borderColor: '#4c7b9a', color: '#c6d4df', '&:hover': { borderColor: '#66c0f4' } }}
            >
              설치
            </Button>
            <Button
              variant="text"
              size="small"
              startIcon={<StorefrontIcon />}
              onClick={() => navigate(`/game/${game.id}`)}
              sx={{ fontSize: '0.8rem', height: 34, color: '#8fa4b9', '&:hover': { color: '#66c0f4' } }}
            >
              스토어
            </Button>
          </>
        )}
      </Box>
    </Box>
  )
}
