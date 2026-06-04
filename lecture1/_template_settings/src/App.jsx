import { useState } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
import {
  Box, AppBar, Toolbar, Typography, Drawer, List, ListItem,
  ListItemButton, ListItemIcon, ListItemText, IconButton, Divider,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'
import HomeIcon from '@mui/icons-material/Home'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import DashboardIcon from '@mui/icons-material/Dashboard'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import Profile from './pages/Profile'
import Settings from './pages/Settings'

const DRAWER_WIDTH = 240

const menuItems = [
  { text: '홈', icon: <HomeIcon />, path: '/' },
  { text: '대시보드', icon: <DashboardIcon />, path: '/dashboard' },
  { text: '프로필', icon: <PersonIcon />, path: '/profile' },
  { text: '설정', icon: <SettingsIcon />, path: '/settings' },
]

function Layout() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const location = useLocation()

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton color="inherit" edge="start" onClick={() => setOpen(!open)} sx={{ mr: 2 }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap>My App</Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="temporary"
        open={open}
        onClose={() => setOpen(false)}
        sx={{
          '& .MuiDrawer-paper': { width: DRAWER_WIDTH, boxSizing: 'border-box' },
        }}
      >
        <Toolbar />
        <Divider />
        <List>
          {menuItems.map(({ text, icon, path }) => {
            const isSelected = location.pathname === path
            return (
              <ListItem key={text} disablePadding sx={{ px: 1, py: 0.5 }}>
                <ListItemButton
                  selected={isSelected}
                  onClick={() => { navigate(path); setOpen(false) }}
                  sx={{
                    borderRadius: 2,
                    backgroundColor: isSelected ? 'primary.main' : 'transparent',
                    color: isSelected ? 'white' : 'text.primary',
                    '& .MuiListItemIcon-root': {
                      color: isSelected ? 'white' : 'text.secondary',
                    },
                    '&:hover': {
                      backgroundColor: isSelected ? 'primary.dark' : 'action.hover',
                    },
                    '&.Mui-selected': {
                      backgroundColor: 'primary.main',
                      '&:hover': { backgroundColor: 'primary.dark' },
                    },
                  }}
                >
                  <ListItemIcon sx={{ minWidth: 40 }}>{icon}</ListItemIcon>
                  <ListItemText
                    primary={text}
                    primaryTypographyProps={{ fontWeight: isSelected ? 700 : 400 }}
                  />
                </ListItemButton>
              </ListItem>
            )
          })}
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{ flexGrow: 1, p: 3 }}
      >
        <Toolbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Box>
    </Box>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout />
    </BrowserRouter>
  )
}
