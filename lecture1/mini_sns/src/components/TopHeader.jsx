import { Box, Avatar, Typography, IconButton, Tooltip } from '@mui/material'
import PersonIcon from '@mui/icons-material/Person'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function TopHeader() {
  const navigate = useNavigate()
  const { profile } = useAuth()

  if (!profile) return null

  return (
    <Box sx={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      height: 44,
      bgcolor: '#16202d',
      borderBottom: '1px solid #2a475e',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-end',
      px: 2.5,
      gap: 1.5,
    }}>
      <Tooltip title="내 프로필" placement="bottom-end">
        <Box
          onClick={() => navigate(`/profile/${profile.id}`)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            gap: 1.2,
            cursor: 'pointer',
            px: 1.5,
            py: 0.5,
            borderRadius: 1,
            transition: 'background 0.15s',
            '&:hover': { bgcolor: '#2a475e' },
          }}
        >
          {/* Online dot + name */}
          <Box sx={{ textAlign: 'right' }}>
            <Typography sx={{ fontSize: '0.82rem', fontWeight: 700, color: '#c6d4df', lineHeight: 1.2 }}>
              {profile.display_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: 0.4 }}>
              <Box sx={{ width: 6, height: 6, borderRadius: '50%', bgcolor: '#5ba32b' }} />
              <Typography sx={{ fontSize: '0.68rem', color: '#8fa4b9' }}>온라인</Typography>
            </Box>
          </Box>
          <Avatar
            sx={{
              width: 30,
              height: 30,
              bgcolor: '#2a475e',
              fontSize: '0.85rem',
              border: '2px solid #3d6b8e',
            }}
          >
            {profile.display_name?.[0]?.toUpperCase()}
          </Avatar>
        </Box>
      </Tooltip>
    </Box>
  )
}
