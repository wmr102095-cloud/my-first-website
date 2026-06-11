import { Box, BottomNavigation, BottomNavigationAction } from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined'
import PersonIcon from '@mui/icons-material/Person'
import PersonOutlineIcon from '@mui/icons-material/PersonOutlined'
import SearchIcon from '@mui/icons-material/Search'
import { useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function BottomNav() {
  const navigate = useNavigate()
  const location = useLocation()
  const { profile } = useAuth()

  const routes = ['/', '/search', `/profile/${profile?.id}`]
  const current = routes.findIndex(r => location.pathname === r)

  return (
    <Box sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1000, maxWidth: 600, mx: 'auto' }}>
      <BottomNavigation
        value={current === -1 ? false : current}
        onChange={(_, v) => navigate(routes[v])}
        sx={{ borderTop: '1px solid #dbdbdb', bgcolor: '#fff' }}
      >
        <BottomNavigationAction icon={current === 0 ? <HomeIcon /> : <HomeOutlinedIcon />} />
        <BottomNavigationAction icon={<SearchIcon />} />
        <BottomNavigationAction icon={current === 2 ? <PersonIcon /> : <PersonOutlineIcon />} />
      </BottomNavigation>
    </Box>
  )
}
