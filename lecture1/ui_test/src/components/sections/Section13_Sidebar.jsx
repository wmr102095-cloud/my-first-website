import { useState } from 'react'
import {
  Box, Typography, Divider, Button, Stack, ToggleButton, ToggleButtonGroup,
  Drawer, List, ListItem, ListItemButton, ListItemIcon, ListItemText,
} from '@mui/material'
import HomeIcon from '@mui/icons-material/Home'
import DashboardIcon from '@mui/icons-material/Dashboard'
import ArticleIcon from '@mui/icons-material/Article'
import PeopleIcon from '@mui/icons-material/People'
import BarChartIcon from '@mui/icons-material/BarChart'
import CloseIcon from '@mui/icons-material/Close'

const navItems = [
  { label: '홈',      icon: <HomeIcon /> },
  { label: '대시보드', icon: <DashboardIcon /> },
  { label: '게시글',  icon: <ArticleIcon /> },
  { label: '사용자',  icon: <PeopleIcon /> },
  { label: '통계',    icon: <BarChartIcon /> },
]

export default function Section13_Sidebar() {
  const [open, setOpen]       = useState(false)
  const [anchor, setAnchor]   = useState('left')
  const [active, setActive]   = useState('홈')

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        13. Sidebar
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack direction="row" spacing={2} alignItems="center" flexWrap="wrap" gap={1}>
        <ToggleButtonGroup
          value={anchor}
          exclusive
          size="small"
          onChange={(_, v) => v && setAnchor(v)}
        >
          <ToggleButton value="left">왼쪽</ToggleButton>
          <ToggleButton value="right">오른쪽</ToggleButton>
        </ToggleButtonGroup>

        <Button variant="contained" onClick={() => setOpen(true)}>
          사이드바 열기
        </Button>
      </Stack>

      <Drawer anchor={anchor} open={open} onClose={() => setOpen(false)}>
        <Box sx={{ width: 240 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', px: 2, py: 1.5 }}>
            <Typography variant="h6" fontWeight={700}>MyApp</Typography>
            <ListItemButton onClick={() => setOpen(false)} sx={{ width: 'auto', borderRadius: 1, p: 0.5 }}>
              <CloseIcon fontSize="small" />
            </ListItemButton>
          </Box>
          <Divider />
          <List sx={{ pt: 1 }}>
            {navItems.map(({ label, icon }) => {
              const isActive = active === label
              return (
                <ListItem key={label} disablePadding sx={{ px: 1, py: 0.25 }}>
                  <ListItemButton
                    selected={isActive}
                    onClick={() => { setActive(label); setOpen(false) }}
                    sx={{
                      borderRadius: 1.5,
                      '&.Mui-selected': { backgroundColor: 'primary.main', color: 'white',
                        '& .MuiListItemIcon-root': { color: 'white' },
                        '&:hover': { backgroundColor: 'primary.dark' },
                      },
                    }}
                  >
                    <ListItemIcon sx={{ minWidth: 38 }}>{icon}</ListItemIcon>
                    <ListItemText
                      primary={label}
                      primaryTypographyProps={{ fontWeight: isActive ? 700 : 400 }}
                    />
                  </ListItemButton>
                </ListItem>
              )
            })}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
