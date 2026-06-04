import { useState } from 'react'
import { Box, Typography, Divider, Stack, Paper, Slider } from '@mui/material'

const marks = [
  { value: 0,   label: '0' },
  { value: 25,  label: '25' },
  { value: 50,  label: '50' },
  { value: 75,  label: '75' },
  { value: 100, label: '100' },
]

const getLevel = (value) => {
  if (value <= 25)  return { label: '매우 낮음', color: 'error.main' }
  if (value <= 50)  return { label: '낮음',     color: 'warning.main' }
  if (value <= 75)  return { label: '높음',     color: 'info.main' }
  return             { label: '매우 높음',       color: 'success.main' }
}

export default function Section07_Slider() {
  const [value, setValue] = useState(50)
  const level = getLevel(value)

  return (
    <Box sx={{ mb: 6 }}>
      <Typography variant="h5" fontWeight={600} gutterBottom>
        07. Slider
      </Typography>
      <Divider sx={{ mb: 3 }} />

      <Stack spacing={3} maxWidth={480}>
        <Box sx={{ px: 1 }}>
          <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 2 }}>
            값 선택 (0 ~ 100)
          </Typography>
          <Slider
            value={value}
            onChange={(_, v) => setValue(v)}
            min={0}
            max={100}
            marks={marks}
            valueLabelDisplay="auto"
          />
        </Box>

        <Paper variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
          <Typography variant="subtitle2" color="text.secondary" gutterBottom>
            현재 값
          </Typography>
          <Typography variant="h4" fontWeight={700} color="primary.main">
            {value}
          </Typography>
          <Typography variant="body2" color={level.color} fontWeight={600} sx={{ mt: 0.5 }}>
            {level.label}
          </Typography>
        </Paper>
      </Stack>
    </Box>
  )
}
