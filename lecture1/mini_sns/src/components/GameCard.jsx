import { Box, Typography, Chip } from '@mui/material'
import { useNavigate } from 'react-router-dom'

export default function GameCard({ game, size = 'md' }) {
  const navigate = useNavigate()
  const small = size === 'sm'

  return (
    <Box
      onClick={() => navigate(`/game/${game.id}`)}
      sx={{
        cursor: 'pointer',
        borderRadius: 1,
        overflow: 'hidden',
        bgcolor: '#16202d',
        border: '1px solid #2a475e',
        transition: 'transform 0.15s, border-color 0.15s, box-shadow 0.15s',
        '&:hover': { transform: 'translateY(-3px)', borderColor: '#66c0f4', boxShadow: '0 6px 20px rgba(0,0,0,0.5)' },
      }}
    >
      {/* Thumbnail */}
      <Box sx={{ position: 'relative', aspectRatio: '460/215', bgcolor: '#0e1620', overflow: 'hidden' }}>
        {game.headerImg ? (
          <Box
            component="img"
            src={game.headerImg}
            alt={game.title}
            sx={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex' }}
          />
        ) : null}
        <Box sx={{
          display: game.headerImg ? 'none' : 'flex',
          width: '100%',
          height: '100%',
          background: game.gradient,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: 0.5,
          position: game.headerImg ? 'absolute' : 'relative',
          top: 0, left: 0,
        }}>
          <Typography sx={{ fontSize: small ? '0.95rem' : '1.1rem', fontWeight: 900, color: game.accentColor, textAlign: 'center', px: 1, letterSpacing: '0.04em' }}>
            {game.title}
          </Typography>
          <Typography sx={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.5)', textTransform: 'uppercase', letterSpacing: '0.1em' }}>
            {game.titleEn}
          </Typography>
        </Box>

        {/* Discount badge */}
        {game.discount > 0 && (
          <Box sx={{ position: 'absolute', top: 6, right: 6, bgcolor: '#4c6b22', px: 1, py: 0.3, borderRadius: 0.5 }}>
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 800, color: '#d9f5a5' }}>-{game.discount}%</Typography>
          </Box>
        )}
      </Box>

      {/* Info */}
      <Box sx={{ p: small ? 1.2 : 1.5 }}>
        <Typography sx={{ fontSize: small ? '0.82rem' : '0.9rem', fontWeight: 700, color: '#c6d4df', mb: 0.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game.title}
        </Typography>
        <Typography sx={{ fontSize: '0.75rem', color: '#8fa4b9', mb: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
          {game.genre.join(' · ')}
        </Typography>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
            <Box sx={{ fontSize: '0.7rem', color: game.rating >= 80 ? '#66c0f4' : game.rating >= 70 ? '#a8cfe8' : '#8fa4b9' }}>
              {'★'} {game.rating}%
            </Box>
          </Box>
          <Box sx={{ textAlign: 'right' }}>
            {game.discount > 0 && (
              <Typography sx={{ fontSize: '0.7rem', color: '#8fa4b9', textDecoration: 'line-through', lineHeight: 1 }}>
                {game.originalPrice}
              </Typography>
            )}
            <Typography sx={{ fontSize: '0.8rem', fontWeight: 700, color: game.price === '무료' ? '#5ba32b' : '#c6d4df' }}>
              {game.discount > 0 ? game.price : game.price}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}
