import { useState } from 'react'
import {
  Box, AppBar, Toolbar, Typography, Button, IconButton,
  Drawer, List, ListItem, ListItemButton, ListItemText,
  Divider, useMediaQuery, useTheme,
} from '@mui/material'
import MenuIcon from '@mui/icons-material/Menu'

const menuItems = ['홈', '소개', '서비스', '연락처']

export default function Section03_Navigation() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))

  const handleClick = (menu) => {
    alert(`메뉴 클릭: ${menu}`)
    setDrawerOpen(false)
  }

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        03. Navigation
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Box sx={{ borderRadius: 2, overflow: 'hidden' }}>
        <AppBar position="static">
          <Toolbar>
            <Typography variant="h6" sx={{ flexGrow: 1 }}>
              MyApp
            </Typography>

            {isMobile ? (
              <IconButton color="inherit" onClick={() => setDrawerOpen(true)}>
                <MenuIcon />
              </IconButton>
            ) : (
              <Box sx={{ display: 'flex', gap: 1 }}>
                {menuItems.map((menu) => (
                  <Button key={menu} color="inherit" onClick={() => handleClick(menu)}>
                    {menu}
                  </Button>
                ))}
              </Box>
            )}
          </Toolbar>
        </AppBar>
      </Box>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 220, pt: 2 }}>
          <Typography variant="subtitle1" fontWeight={600} sx={{ px: 2, pb: 1 }}>
            메뉴
          </Typography>
          <Divider />
          <List>
            {menuItems.map((menu) => (
              <ListItem key={menu} disablePadding>
                <ListItemButton onClick={() => handleClick(menu)}>
                  <ListItemText primary={menu} />
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Box>
      </Drawer>
    </Box>
  )
}
