import { useState } from 'react'
import {
  Box, Typography, Divider, Button, Paper,
  Menu, MenuItem, ListItemIcon, ListItemText,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import PersonIcon from '@mui/icons-material/Person'
import SettingsIcon from '@mui/icons-material/Settings'
import NotificationsIcon from '@mui/icons-material/Notifications'
import HelpIcon from '@mui/icons-material/Help'
import LogoutIcon from '@mui/icons-material/Logout'
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown'

const menuItems = [
  { label: '홈',       icon: <HomeIcon fontSize="small" /> },
  { label: '프로필',   icon: <PersonIcon fontSize="small" /> },
  { label: '알림',     icon: <NotificationsIcon fontSize="small" /> },
  { label: '설정',     icon: <SettingsIcon fontSize="small" /> },
  { label: '도움말',   icon: <HelpIcon fontSize="small" /> },
  { label: '로그아웃', icon: <LogoutIcon fontSize="small" color="error" />, color: 'error.main' },
]

export default function Section12_Menu() {
  const [anchor, setAnchor] = useState(null)
  const [selected, setSelected] = useState(null)

  const open = Boolean(anchor)

  const handleSelect = (label) => {
    setSelected(label)
    setAnchor(null)
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        12. Menu
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 3, flexWrap: 'wrap' }}>
        <Button
          variant="contained"
          endIcon={<KeyboardArrowDownIcon sx={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />}
          onClick={(e) => setAnchor(e.currentTarget)}
        >
          메뉴 열기
        </Button>

        <Menu
          anchorEl={anchor}
          open={open}
          onClose={() => setAnchor(null)}
          transformOrigin={{ horizontal: 'left', vertical: 'top' }}
          anchorOrigin={{ horizontal: 'left', vertical: 'bottom' }}
        >
          {menuItems.map(({ label, icon, color }) => (
            <MenuItem key={label} onClick={() => handleSelect(label)}>
              <ListItemIcon>{icon}</ListItemIcon>
              <ListItemText
                primary={label}
                primaryTypographyProps={{ color: color ?? 'text.primary' }}
              />
            </MenuItem>
          ))}
        </Menu>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2, minWidth: 180 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            선택된 메뉴
          </Typography>
          <Typography variant="body1" fontWeight={600}>
            {selected ?? <Box component="span" color="text.disabled">(없음)</Box>}
          </Typography>
        </Paper>
      </Box>
    </Box>
  )
}
