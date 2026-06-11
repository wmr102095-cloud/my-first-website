import { AppBar, Toolbar, Typography, IconButton, Box } from '@mui/material'
import AddBoxOutlinedIcon from '@mui/icons-material/AddBoxOutlined'
import { useNavigate } from 'react-router-dom'

export default function TopBar({ title }) {
  const navigate = useNavigate()
  return (
    <AppBar position="fixed" elevation={0}>
      <Toolbar sx={{ minHeight: 56, px: 2 }}>
        <Typography
          variant="h6"
          onClick={() => navigate('/')}
          sx={{
            flex: 1,
            fontFamily: '"Billabong", "Dancing Script", cursive',
            fontSize: '1.6rem',
            fontWeight: 400,
            letterSpacing: '0.03em',
            cursor: 'pointer',
            color: '#262626',
            userSelect: 'none',
          }}
        >
          {title || 'MiniSNS'}
        </Typography>
        <IconButton onClick={() => navigate('/write')} sx={{ color: '#262626' }}>
          <AddBoxOutlinedIcon />
        </IconButton>
      </Toolbar>
    </AppBar>
  )
}
