import { useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import {
  AppBar, Toolbar, Typography, Button, Box, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText, Divider, Avatar,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import LoginIcon from '@mui/icons-material/Login'
import LogoutIcon from '@mui/icons-material/Logout'
import AddIcon from '@mui/icons-material/Add'
import PersonAddIcon from '@mui/icons-material/PersonAdd'

const BRANDS = [
  { key: 'benz',  label: 'BENZ',  logo: '/logos/mercedes.webp' },
  { key: 'audi',  label: 'AUDI',  logo: '/logos/audi.svg'      },
  { key: 'bmw',   label: 'BMW',   logo: '/logos/bmw.svg'       },
]

function BrandLogo({ src, alt, size = 28 }) {
  return (
    <img
      src={src}
      alt={alt}
      style={{
        width: size,
        height: size,
        objectFit: 'contain',
        filter: 'brightness(0) invert(1)',
        opacity: 0.9,
      }}
    />
  )
}

export default function Navbar({ profile, onLogout }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <>
      <AppBar position="fixed" elevation={0}>
        <Toolbar sx={{ gap: 1 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={() => setDrawerOpen(true)}
            sx={{ display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* 로고 영역 */}
          <Box
            sx={{ display: 'flex', alignItems: 'center', gap: 1.5, cursor: 'pointer', flexGrow: { xs: 1, sm: 0 } }}
            onClick={() => navigate('/')}
          >
            {BRANDS.map((b, i) => (
              <Box key={b.key} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                {i > 0 && (
                  <Typography sx={{ color: 'rgba(232,232,232,0.2)', fontSize: 16, userSelect: 'none' }}>·</Typography>
                )}
                <BrandLogo src={b.logo} alt={b.label} size={26} />
              </Box>
            ))}
          </Box>

          {/* 데스크톱 메뉴 */}
          <Box sx={{ display: { xs: 'none', sm: 'flex' }, gap: 0.5, flexGrow: 1, ml: 3 }}>
            <Button
              startIcon={<HomeIcon />}
              onClick={() => navigate('/')}
              sx={{
                color: isActive('/') ? 'primary.main' : 'text.secondary',
                borderBottom: isActive('/') ? '2px solid' : '2px solid transparent',
                borderRadius: 0,
                borderColor: 'primary.main',
              }}
            >
              게시판
            </Button>
          </Box>

          {/* 우측 액션 */}
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            {profile ? (
              <>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<AddIcon />}
                  onClick={() => navigate('/write')}
                  sx={{ display: { xs: 'none', sm: 'flex' }, borderColor: 'rgba(232,232,232,0.3)', color: 'text.secondary' }}
                >
                  글쓰기
                </Button>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.dark', fontSize: 14, fontWeight: 700 }}>
                    {profile.username?.[0]?.toUpperCase() || '?'}
                  </Avatar>
                  <Typography variant="body2" sx={{ color: 'text.primary', display: { xs: 'none', sm: 'block' } }}>
                    {profile.username}
                  </Typography>
                </Box>
                <IconButton size="small" onClick={onLogout} title="로그아웃">
                  <LogoutIcon fontSize="small" sx={{ color: 'text.secondary' }} />
                </IconButton>
              </>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="outlined"
                  size="small"
                  startIcon={<PersonAddIcon />}
                  onClick={() => navigate('/register')}
                  sx={{ display: { xs: 'none', sm: 'flex' }, borderColor: 'rgba(232,232,232,0.3)', color: 'text.secondary' }}
                >
                  회원가입
                </Button>
                <Button
                  variant="contained"
                  size="small"
                  startIcon={<LoginIcon />}
                  onClick={() => navigate('/login')}
                  sx={{ fontWeight: 600 }}
                >
                  로그인
                </Button>
              </Box>
            )}
          </Box>
        </Toolbar>
      </AppBar>

      {/* 모바일 드로어 */}
      <Drawer anchor="left" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 260, bgcolor: 'background.paper', height: '100%', pt: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, px: 2, mb: 2 }}>
            {BRANDS.map((b) => (
              <BrandLogo key={b.key} src={b.logo} alt={b.label} size={24} />
            ))}
          </Box>
          <Divider />
          {profile && (
            <>
              <Box sx={{ px: 2, py: 2, display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar sx={{ bgcolor: 'secondary.dark', fontWeight: 700 }}>
                  {profile.username?.[0]?.toUpperCase() || '?'}
                </Avatar>
                <Typography variant="body2" fontWeight={600}>{profile.username}</Typography>
              </Box>
              <Divider />
            </>
          )}
          <List>
            <ListItem disablePadding>
              <ListItemButton selected={isActive('/')} onClick={() => { navigate('/'); setDrawerOpen(false) }}>
                <ListItemText primary="게시판" />
              </ListItemButton>
            </ListItem>
            {profile && (
              <ListItem disablePadding>
                <ListItemButton onClick={() => { navigate('/write'); setDrawerOpen(false) }}>
                  <ListItemText primary="글쓰기" />
                </ListItemButton>
              </ListItem>
            )}
          </List>
          <Divider />
          <List>
            {profile ? (
              <ListItem disablePadding>
                <ListItemButton onClick={() => { onLogout(); setDrawerOpen(false) }}>
                  <ListItemText primary="로그아웃" />
                </ListItemButton>
              </ListItem>
            ) : (
              <>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { navigate('/login'); setDrawerOpen(false) }}>
                    <ListItemText primary="로그인" />
                  </ListItemButton>
                </ListItem>
                <ListItem disablePadding>
                  <ListItemButton onClick={() => { navigate('/register'); setDrawerOpen(false) }}>
                    <ListItemText primary="회원가입" />
                  </ListItemButton>
                </ListItem>
              </>
            )}
          </List>
        </Box>
      </Drawer>
    </>
  )
}
