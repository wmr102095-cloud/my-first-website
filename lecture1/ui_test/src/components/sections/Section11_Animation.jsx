import { useState } from 'react'
import {
  Box, Typography, Divider, Grid, Button, Paper,
  Fade, Grow, Slide,
} from '@mui/material'
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome'
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch'
import WavesIcon from '@mui/icons-material/Waves'
import FlareIcon from '@mui/icons-material/Flare'

const keyframes = `
  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50%       { transform: translateY(-20px); }
  }
  @keyframes spin {
    from { transform: rotate(0deg); }
    to   { transform: rotate(360deg); }
  }
  @keyframes pulse {
    0%, 100% { transform: scale(1);    opacity: 1; }
    50%       { transform: scale(1.3); opacity: 0.6; }
  }
`

const animations = [
  {
    key: 'fade',
    label: 'Fade',
    desc: 'MUI Fade 트랜지션',
    color: 'primary.main',
    icon: <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
    render: (active) => (
      <Fade in={active} timeout={600}>
        <Box sx={{ textAlign: 'center' }}>
          <AutoAwesomeIcon sx={{ fontSize: 40, color: 'primary.main' }} />
          <Typography variant="caption" display="block" color="primary.main" fontWeight={600}>Fade In</Typography>
        </Box>
      </Fade>
    ),
  },
  {
    key: 'grow',
    label: 'Grow',
    desc: 'MUI Grow 트랜지션',
    color: 'success.main',
    render: (active) => (
      <Grow in={active} timeout={600}>
        <Box sx={{ textAlign: 'center' }}>
          <RocketLaunchIcon sx={{ fontSize: 40, color: 'success.main' }} />
          <Typography variant="caption" display="block" color="success.main" fontWeight={600}>Grow In</Typography>
        </Box>
      </Grow>
    ),
  },
  {
    key: 'slide',
    label: 'Slide',
    desc: 'MUI Slide 트랜지션',
    color: 'secondary.main',
    render: (active) => (
      <Slide in={active} direction="up" timeout={500}>
        <Box sx={{ textAlign: 'center' }}>
          <WavesIcon sx={{ fontSize: 40, color: 'secondary.main' }} />
          <Typography variant="caption" display="block" color="secondary.main" fontWeight={600}>Slide Up</Typography>
        </Box>
      </Slide>
    ),
  },
  {
    key: 'bounce',
    label: 'Bounce',
    desc: 'CSS @keyframes bounce',
    color: 'warning.main',
    render: (active) => (
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-block',
            animation: active ? 'bounce 0.6s ease infinite' : 'none',
          }}
        >
          <FlareIcon sx={{ fontSize: 40, color: 'warning.main' }} />
        </Box>
        <Typography variant="caption" display="block" color="warning.main" fontWeight={600}>Bounce</Typography>
      </Box>
    ),
  },
  {
    key: 'spin',
    label: 'Spin',
    desc: 'CSS @keyframes rotate',
    color: 'info.main',
    render: (active) => (
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-block',
            animation: active ? 'spin 1s linear infinite' : 'none',
          }}
        >
          <AutoAwesomeIcon sx={{ fontSize: 40, color: 'info.main' }} />
        </Box>
        <Typography variant="caption" display="block" color="info.main" fontWeight={600}>Spin</Typography>
      </Box>
    ),
  },
  {
    key: 'pulse',
    label: 'Pulse',
    desc: 'CSS @keyframes scale + opacity',
    color: 'error.main',
    render: (active) => (
      <Box sx={{ textAlign: 'center' }}>
        <Box
          sx={{
            display: 'inline-block',
            animation: active ? 'pulse 0.8s ease-in-out infinite' : 'none',
          }}
        >
          <RocketLaunchIcon sx={{ fontSize: 40, color: 'error.main' }} />
        </Box>
        <Typography variant="caption" display="block" color="error.main" fontWeight={600}>Pulse</Typography>
      </Box>
    ),
  },
]

export default function Section11_Animation() {
  const [actives, setActives] = useState({})

  const toggle = (key) =>
    setActives((prev) => ({ ...prev, [key]: !prev[key] }))

  return (
    <Box sx={{ mb: 6 }}>
      <style>{keyframes}</style>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        11. Animation
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Grid container spacing={2}>
        {animations.map(({ key, label, desc, render }) => (
          <Grid key={key} size={{ xs: 12, sm: 6, md: 4 }}>
            <Paper
              variant="outlined"
              sx={{ p: 2.5, borderRadius: 2, textAlign: 'center' }}
            >
              <Box sx={{ height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
                {render(!!actives[key])}
              </Box>
              <Typography variant="subtitle2" fontWeight={600}>{label}</Typography>
              <Typography variant="caption" color="text.secondary" display="block" sx={{ mb: 1.5 }}>
                {desc}
              </Typography>
              <Button
                size="small"
                variant={actives[key] ? 'contained' : 'outlined'}
                onClick={() => toggle(key)}
              >
                {actives[key] ? '정지' : '재생'}
              </Button>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
