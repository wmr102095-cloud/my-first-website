import { Box, Typography, Avatar, List, ListItemButton, ListItemIcon, ListItemText, Divider, IconButton } from '@mui/material'
import StorefrontIcon from '@mui/icons-material/Storefront'
import VideoLibraryIcon from '@mui/icons-material/VideoLibrary'
import ForumIcon from '@mui/icons-material/Forum'
import PersonIcon from '@mui/icons-material/Person'
import LogoutIcon from '@mui/icons-material/Logout'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { supabase } from '../supabaseClient'

const NAV = [
  { label: '스토어', icon: <StorefrontIcon fontSize="small" />, path: '/' },
  { label: '라이브러리', icon: <VideoLibraryIcon fontSize="small" />, path: '/library' },
  { label: '커뮤니티', icon: <ForumIcon fontSize="small" />, path: '/community' },
]

export default function Sidebar() {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const { profile } = useAuth()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  const active = (path) => {
    if (path === '/') return pathname === '/'
    return pathname.startsWith(path)
  }

  return (
    <Box sx={{
      width: 220,
      height: '100vh',
      position: 'fixed',
      left: 0,
      top: 0,
      bgcolor: '#171d25',
      display: 'flex',
      flexDirection: 'column',
      borderRight: '1px solid #2a475e',
      zIndex: 200,
    }}>
      {/* Logo */}
      <Box sx={{ px: 2.5, pt: 2.5, pb: 1.5 }}>
        <Typography
          onClick={() => navigate('/')}
          sx={{
            fontSize: '2rem',
            fontWeight: 900,
            letterSpacing: '0.12em',
            cursor: 'pointer',
            background: 'linear-gradient(135deg, #66c0f4, #1a44c2)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            userSelect: 'none',
          }}
        >
          StyX
        </Typography>
      </Box>

      {/* User info */}
      {profile && (
        <Box sx={{ px: 2, pb: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
          <Avatar
            onClick={() => navigate(`/profile/${profile.id}`)}
            sx={{ width: 38, height: 38, bgcolor: '#2a475e', fontSize: '1rem', cursor: 'pointer', border: '2px solid #3d6b8e' }}
          >
            {profile.display_name?.[0]?.toUpperCase()}
          </Avatar>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography sx={{ fontSize: '0.85rem', fontWeight: 700, color: '#c6d4df', lineHeight: 1.2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {profile.display_name}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
              <Box sx={{ width: 7, height: 7, borderRadius: '50%', bgcolor: '#5ba32b' }} />
              <Typography sx={{ fontSize: '0.72rem', color: '#8fa4b9' }}>온라인</Typography>
            </Box>
          </Box>
          <IconButton onClick={handleLogout} size="small" sx={{ color: '#8fa4b9', '&:hover': { color: '#c6d4df' } }}>
            <LogoutIcon fontSize="small" />
          </IconButton>
        </Box>
      )}

      <Divider />

      {/* Main navigation */}
      <List dense sx={{ pt: 1, px: 1 }}>
        {NAV.map((item) => (
          <ListItemButton
            key={item.path}
            onClick={() => navigate(item.path)}
            selected={active(item.path)}
            sx={{
              borderRadius: 1,
              mb: 0.3,
              '&.Mui-selected': { bgcolor: '#2a475e', color: '#66c0f4', '& .MuiListItemIcon-root': { color: '#66c0f4' } },
              '&:hover': { bgcolor: '#1e2d3d' },
              '& .MuiListItemIcon-root': { color: '#8fa4b9', minWidth: 34 },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontSize: '0.875rem', fontWeight: active(item.path) ? 700 : 400 }} />
          </ListItemButton>
        ))}
      </List>

      <Box sx={{ mt: 'auto' }}>
        <Divider />
        <List dense sx={{ px: 1, py: 1 }}>
          <ListItemButton
            onClick={() => profile && navigate(`/profile/${profile.id}`)}
            sx={{ borderRadius: 1, '&:hover': { bgcolor: '#1e2d3d' }, '& .MuiListItemIcon-root': { color: '#8fa4b9', minWidth: 34 } }}
          >
            <ListItemIcon><PersonIcon fontSize="small" /></ListItemIcon>
            <ListItemText primary="내 프로필" primaryTypographyProps={{ fontSize: '0.85rem', color: '#8fa4b9' }} />
          </ListItemButton>
        </List>
      </Box>
    </Box>
  )
}
